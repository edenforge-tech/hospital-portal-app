using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using AuthService.Context;
using AuthService.Data;
using AuthService.Models.Counselor;
using AuthService.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AuthService.Services
{
    public class TranscriptionService : ITranscriptionService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<TranscriptionService> _logger;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        private readonly IBlobStorageService _blobStorage;

        // Azure Speech Service Configuration
        private readonly string? _speechKey;
        private readonly string? _speechRegion;
        private readonly string? _speechEndpoint;

        // Azure Translator Configuration
        private readonly string? _translatorKey;
        private readonly string? _translatorRegion;
        private readonly string? _translatorEndpoint;

        public TranscriptionService(
            AppDbContext context,
            ILogger<TranscriptionService> logger,
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory,
            IBlobStorageService blobStorage)
        {
            _context = context;
            _logger = logger;
            _configuration = configuration;
            _httpClient = httpClientFactory.CreateClient();
            _blobStorage = blobStorage;

            // Load Azure configuration
            _speechKey = _configuration["AzureSpeech:Key"];
            _speechRegion = _configuration["AzureSpeech:Region"];
            _speechEndpoint = _configuration["AzureSpeech:Endpoint"];

            _translatorKey = _configuration["AzureTranslator:Key"];
            _translatorRegion = _configuration["AzureTranslator:Region"];
            _translatorEndpoint = _configuration["AzureTranslator:Endpoint"];
        }

        public async Task<TranscriptionJobResponse> StartTranscriptionAsync(
            Guid tenantId,
            Guid recordingId,
            string sourceLanguage = "en-US")
        {
            try
            {
                // Get recording
                var recording = await _context.SessionRecordings
                    .FirstOrDefaultAsync(r => r.Id == recordingId && r.TenantId == tenantId && r.DeletedAt == null);

                if (recording == null)
                    throw new InvalidOperationException("Recording not found");

                if (recording.TranscriptionStatus == "Completed")
                {
                    return new TranscriptionJobResponse
                    {
                        RecordingId = recordingId,
                        Status = "AlreadyCompleted",
                        Message = "Transcription already completed"
                    };
                }

                // Check Azure configuration
                if (string.IsNullOrEmpty(_speechKey) || string.IsNullOrEmpty(_speechRegion))
                {
                    _logger.LogWarning("Azure Speech Service not configured. Transcription will not be performed.");
                    recording.TranscriptionStatus = "NotRequested";
                    recording.TranscriptionError = "Azure Speech Service not configured";
                    await _context.SaveChangesAsync();

                    return new TranscriptionJobResponse
                    {
                        RecordingId = recordingId,
                        Status = "NotConfigured",
                        Message = "Azure Speech Service is not configured"
                    };
                }

                // Update status to InProgress
                recording.TranscriptionStatus = "InProgress";
                recording.TranscriptionStartedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                // Submit to Azure Speech-to-Text (Batch Transcription API)
                var jobId = await SubmitToAzureSpeechAsync(recording.FileUrl, sourceLanguage);

                // Update with job ID
                recording.AzureJobId = jobId;
                await _context.SaveChangesAsync();

                return new TranscriptionJobResponse
                {
                    RecordingId = recordingId,
                    Status = "InProgress",
                    JobId = jobId,
                    Message = "Transcription job started successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting transcription for recording {RecordingId}", recordingId);

                // Update recording with error
                var recording = await _context.SessionRecordings.FindAsync(recordingId);
                if (recording != null)
                {
                    recording.TranscriptionStatus = "Failed";
                    recording.TranscriptionError = ex.Message;
                    await _context.SaveChangesAsync();
                }

                throw;
            }
        }

        private async Task<string> SubmitToAzureSpeechAsync(string fileUrl, string language)
        {
            // Azure Speech Batch Transcription API
            // Docs: https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/batch-transcription

            var endpoint = $"https://{_speechRegion}.api.cognitive.microsoft.com/speechtotext/v3.0/transcriptions";

            var requestBody = new
            {
                contentUrls = new[] { fileUrl },
                locale = language,
                displayName = $"Counseling Session Transcription {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}",
                properties = new
                {
                    diarizationEnabled = false,
                    wordLevelTimestampsEnabled = true,
                    punctuationMode = "DictatedAndAutomatic",
                    profanityFilterMode = "Masked"
                }
            };

            var request = new HttpRequestMessage(HttpMethod.Post, endpoint)
            {
                Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json")
            };
            request.Headers.Add("Ocp-Apim-Subscription-Key", _speechKey);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(responseContent);

            // Extract job ID from response
            var jobId = result.GetProperty("self").GetString()?.Split('/').Last() ?? Guid.NewGuid().ToString();

            return jobId;
        }

        public async Task<string> CheckTranscriptionStatusAsync(Guid recordingId)
        {
            var recording = await _context.SessionRecordings
                .FirstOrDefaultAsync(r => r.Id == recordingId && r.DeletedAt == null);

            if (recording == null)
                throw new InvalidOperationException("Recording not found");

            if (string.IsNullOrEmpty(recording.AzureJobId))
                return "NotStarted";

            try
            {
                // Check status from Azure
                var endpoint = $"https://{_speechRegion}.api.cognitive.microsoft.com/speechtotext/v3.0/transcriptions/{recording.AzureJobId}";

                var request = new HttpRequestMessage(HttpMethod.Get, endpoint);
                request.Headers.Add("Ocp-Apim-Subscription-Key", _speechKey);

                var response = await _httpClient.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<JsonElement>(responseContent);

                var status = result.GetProperty("status").GetString();

                // Update local status
                if (status == "Succeeded" && recording.TranscriptionStatus != "Completed")
                {
                    // Process the transcription result
                    await ProcessTranscriptionResultAsync(recording.TenantId, recordingId, recording.AzureJobId);
                }
                else if (status == "Failed")
                {
                    recording.TranscriptionStatus = "Failed";
                    recording.TranscriptionError = result.GetProperty("error").GetProperty("message").GetString();
                    await _context.SaveChangesAsync();
                }

                return status ?? "Unknown";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking transcription status for recording {RecordingId}", recordingId);
                return "Error";
            }
        }

        public async Task<SessionTranscriptDto> ProcessTranscriptionResultAsync(
            Guid tenantId,
            Guid recordingId,
            string azureJobId)
        {
            try
            {
                var recording = await _context.SessionRecordings
                    .FirstOrDefaultAsync(r => r.Id == recordingId && r.TenantId == tenantId && r.DeletedAt == null);

                if (recording == null)
                    throw new InvalidOperationException("Recording not found");

                // Get transcription results from Azure
                var endpoint = $"https://{_speechRegion}.api.cognitive.microsoft.com/speechtotext/v3.0/transcriptions/{azureJobId}/files";

                var request = new HttpRequestMessage(HttpMethod.Get, endpoint);
                request.Headers.Add("Ocp-Apim-Subscription-Key", _speechKey);

                var response = await _httpClient.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var filesResult = JsonSerializer.Deserialize<JsonElement>(responseContent);

                // Find the transcript file
                var transcriptFile = filesResult.GetProperty("values").EnumerateArray()
                    .FirstOrDefault(f => f.GetProperty("kind").GetString() == "Transcription");

                if (transcriptFile.ValueKind == JsonValueKind.Undefined)
                    throw new InvalidOperationException("Transcript file not found in Azure response");

                var transcriptUrl = transcriptFile.GetProperty("links").GetProperty("contentUrl").GetString();

                // Download transcript content
                var transcriptContent = await _httpClient.GetStringAsync(transcriptUrl);
                var transcript = JsonSerializer.Deserialize<JsonElement>(transcriptContent);

                // Parse segments
                var segments = new List<TranscriptSegment>();
                var fullText = new StringBuilder();

                var recognizedPhrases = transcript.GetProperty("recognizedPhrases");
                foreach (var phrase in recognizedPhrases.EnumerateArray())
                {
                    var nBest = phrase.GetProperty("nBest")[0];
                    var text = nBest.GetProperty("display").GetString();
                    var confidence = nBest.GetProperty("confidence").GetDouble();
                    var offset = phrase.GetProperty("offset").GetInt64() / 10000000.0; // Convert to seconds
                    var duration = phrase.GetProperty("duration").GetInt64() / 10000000.0;

                    if (!string.IsNullOrEmpty(text))
                    {
                        segments.Add(new TranscriptSegment
                        {
                            Start = offset,
                            End = offset + duration,
                            Text = text,
                            Confidence = confidence
                        });

                        fullText.Append(text).Append(" ");
                    }
                }

                // Calculate average confidence
                var avgConfidence = segments.Any() ? segments.Average(s => s.Confidence ?? 0) * 100 : 0;

                // Create transcript record
                var newTranscript = new SessionTranscript
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    RecordingId = recordingId,
                    SessionId = recording.SessionId,
                    LanguageCode = "en-US", // TODO: Get from request
                    LanguageName = "English",
                    IsOriginalLanguage = true,
                    TranscriptText = fullText.ToString().Trim(),
                    ConfidenceScore = (decimal)avgConfidence,
                    WordCount = fullText.ToString().Split(' ', StringSplitOptions.RemoveEmptyEntries).Length,
                    CharacterCount = fullText.Length,
                    Segments = JsonSerializer.Serialize(segments),
                    CreatedAt = DateTime.UtcNow
                };

                _context.SessionTranscripts.Add(newTranscript);

                // Update recording status
                recording.TranscriptionStatus = "Completed";
                recording.TranscriptionCompletedAt = DateTime.UtcNow;
                recording.ProcessingDurationMs = (int)(DateTime.UtcNow - recording.TranscriptionStartedAt!.Value).TotalMilliseconds;

                await _context.SaveChangesAsync();

                return new SessionTranscriptDto
                {
                    Id = newTranscript.Id,
                    RecordingId = newTranscript.RecordingId,
                    LanguageCode = newTranscript.LanguageCode,
                    LanguageName = newTranscript.LanguageName,
                    IsOriginalLanguage = newTranscript.IsOriginalLanguage,
                    TranscriptText = newTranscript.TranscriptText,
                    ConfidenceScore = newTranscript.ConfidenceScore,
                    WordCount = newTranscript.WordCount,
                    Segments = segments,
                    CreatedAt = newTranscript.CreatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing transcription result for recording {RecordingId}", recordingId);

                var recording = await _context.SessionRecordings.FindAsync(recordingId);
                if (recording != null)
                {
                    recording.TranscriptionStatus = "Failed";
                    recording.TranscriptionError = ex.Message;
                    await _context.SaveChangesAsync();
                }

                throw;
            }
        }

        public async Task<TranslationJobResponse> StartTranslationAsync(
            Guid tenantId,
            Guid recordingId,
            Guid sourceTranscriptId,
            List<string> targetLanguages)
        {
            try
            {
                var sourceTranscript = await _context.SessionTranscripts
                    .FirstOrDefaultAsync(t => t.Id == sourceTranscriptId && t.TenantId == tenantId && t.DeletedAt == null);

                if (sourceTranscript == null)
                    throw new InvalidOperationException("Source transcript not found");

                // Check Azure Translator configuration
                if (string.IsNullOrEmpty(_translatorKey) || string.IsNullOrEmpty(_translatorEndpoint))
                {
                    _logger.LogWarning("Azure Translator Service not configured");
                    return new TranslationJobResponse
                    {
                        RecordingId = recordingId,
                        TargetLanguages = targetLanguages,
                        Status = "NotConfigured",
                        Message = "Azure Translator Service is not configured"
                    };
                }

                // Translate to each target language
                var translatedTranscripts = new List<Guid>();

                foreach (var targetLang in targetLanguages)
                {
                    var translatedText = await TranslateTextAsync(sourceTranscript.TranscriptText, sourceTranscript.LanguageCode, targetLang);

                    var newTranscript = new SessionTranscript
                    {
                        Id = Guid.NewGuid(),
                        TenantId = tenantId,
                        RecordingId = recordingId,
                        SessionId = sourceTranscript.SessionId,
                        LanguageCode = targetLang,
                        LanguageName = GetLanguageName(targetLang),
                        IsOriginalLanguage = false,
                        TranscriptText = translatedText,
                        WordCount = translatedText.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length,
                        CharacterCount = translatedText.Length,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.SessionTranscripts.Add(newTranscript);
                    translatedTranscripts.Add(newTranscript.Id);
                }

                // Update recording translation status
                var recording = await _context.SessionRecordings.FindAsync(recordingId);
                if (recording != null)
                {
                    recording.TranslationStatus = "Completed";
                    recording.TranslationCompletedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                return new TranslationJobResponse
                {
                    RecordingId = recordingId,
                    TargetLanguages = targetLanguages,
                    Status = "Completed",
                    Message = $"Translated to {targetLanguages.Count} language(s)"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting translation for recording {RecordingId}", recordingId);

                var recording = await _context.SessionRecordings.FindAsync(recordingId);
                if (recording != null)
                {
                    recording.TranslationStatus = "Failed";
                    recording.TranslationError = ex.Message;
                    await _context.SaveChangesAsync();
                }

                throw;
            }
        }

        private async Task<string> TranslateTextAsync(string text, string fromLang, string toLang)
        {
            // Azure Translator API v3.0
            var endpoint = $"{_translatorEndpoint}/translate?api-version=3.0&from={fromLang}&to={toLang}";

            var requestBody = new[] { new { Text = text } };

            var request = new HttpRequestMessage(HttpMethod.Post, endpoint)
            {
                Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json")
            };
            request.Headers.Add("Ocp-Apim-Subscription-Key", _translatorKey);
            request.Headers.Add("Ocp-Apim-Subscription-Region", _translatorRegion);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(responseContent);

            var translatedText = result[0].GetProperty("translations")[0].GetProperty("text").GetString();

            return translatedText ?? text;
        }

        private string GetLanguageName(string languageCode)
        {
            return languageCode switch
            {
                "en-US" or "en" => "English",
                "hi-IN" or "hi" => "Hindi",
                "te-IN" or "te" => "Telugu",
                _ => languageCode
            };
        }

        public async Task<List<SessionTranscriptDto>> GetTranscriptsAsync(Guid tenantId, Guid recordingId)
        {
            var transcripts = await _context.SessionTranscripts
                .Where(t => t.RecordingId == recordingId && t.TenantId == tenantId && t.DeletedAt == null)
                .OrderBy(t => t.IsOriginalLanguage ? 0 : 1)
                .ThenBy(t => t.LanguageCode)
                .ToListAsync();

            return transcripts.Select(t => new SessionTranscriptDto
            {
                Id = t.Id,
                RecordingId = t.RecordingId,
                LanguageCode = t.LanguageCode,
                LanguageName = t.LanguageName,
                IsOriginalLanguage = t.IsOriginalLanguage,
                TranscriptText = t.TranscriptText,
                ConfidenceScore = t.ConfidenceScore,
                WordCount = t.WordCount,
                Segments = string.IsNullOrEmpty(t.Segments)
                    ? new List<TranscriptSegment>()
                    : JsonSerializer.Deserialize<List<TranscriptSegment>>(t.Segments) ?? new List<TranscriptSegment>(),
                CreatedAt = t.CreatedAt
            }).ToList();
        }

        public async Task<TranscriptEditDto> EditTranscriptSegmentAsync(
            Guid tenantId,
            EditTranscriptRequest request,
            Guid currentUserId)
        {
            var transcript = await _context.SessionTranscripts
                .FirstOrDefaultAsync(t => t.Id == request.TranscriptId && t.TenantId == tenantId && t.DeletedAt == null);

            if (transcript == null)
                throw new InvalidOperationException("Transcript not found");

            var segments = string.IsNullOrEmpty(transcript.Segments)
                ? new List<TranscriptSegment>()
                : JsonSerializer.Deserialize<List<TranscriptSegment>>(transcript.Segments) ?? new List<TranscriptSegment>();

            if (request.SegmentIndex < 0 || request.SegmentIndex >= segments.Count)
                throw new InvalidOperationException("Invalid segment index");

            var originalText = segments[request.SegmentIndex].Text;
            segments[request.SegmentIndex].Text = request.EditedText;

            // Update transcript
            transcript.Segments = JsonSerializer.Serialize(segments);
            transcript.TranscriptText = string.Join(" ", segments.Select(s => s.Text));
            transcript.UpdatedAt = DateTime.UtcNow;

            // Create edit record
            var edit = new TranscriptEdit
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                TranscriptId = request.TranscriptId,
                SegmentIndex = request.SegmentIndex,
                OriginalText = originalText,
                EditedText = request.EditedText,
                EditReason = request.EditReason,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = currentUserId
            };

            _context.TranscriptEdits.Add(edit);
            await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(currentUserId);

            return new TranscriptEditDto
            {
                Id = edit.Id,
                TranscriptId = edit.TranscriptId,
                SegmentIndex = edit.SegmentIndex,
                OriginalText = edit.OriginalText,
                EditedText = edit.EditedText,
                EditReason = edit.EditReason,
                CreatedAt = edit.CreatedAt,
                CreatedByUserName = user?.FirstName + " " + user?.LastName ?? "Unknown"
            };
        }

        public async Task<List<TranscriptEditDto>> GetTranscriptEditsAsync(Guid tenantId, Guid transcriptId)
        {
            var edits = await _context.TranscriptEdits
                .Where(e => e.TranscriptId == transcriptId && e.TenantId == tenantId)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

            var userIds = edits.Select(e => e.CreatedByUserId).Distinct().ToList();
            var users = await _context.Users
                .Where(u => userIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.FirstName + " " + u.LastName);

            return edits.Select(e => new TranscriptEditDto
            {
                Id = e.Id,
                TranscriptId = e.TranscriptId,
                SegmentIndex = e.SegmentIndex,
                OriginalText = e.OriginalText,
                EditedText = e.EditedText,
                EditReason = e.EditReason,
                CreatedAt = e.CreatedAt,
                CreatedByUserName = users.TryGetValue(e.CreatedByUserId, out var name) ? name : "Unknown"
            }).ToList();
        }
    }
}
