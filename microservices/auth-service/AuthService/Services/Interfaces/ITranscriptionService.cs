using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.Models.Counselor;

namespace AuthService.Services.Interfaces
{
    public interface ITranscriptionService
    {
        /// <summary>
        /// Start transcription for a recording using Azure Speech-to-Text
        /// </summary>
        Task<TranscriptionJobResponse> StartTranscriptionAsync(
            Guid tenantId, 
            Guid recordingId, 
            string sourceLanguage = "en-US");

        /// <summary>
        /// Check transcription status from Azure
        /// </summary>
        Task<string> CheckTranscriptionStatusAsync(Guid recordingId);

        /// <summary>
        /// Process completed transcription and store results
        /// </summary>
        Task<SessionTranscriptDto> ProcessTranscriptionResultAsync(
            Guid tenantId, 
            Guid recordingId, 
            string azureJobId);

        /// <summary>
        /// Start translation for a transcript using Azure Translator
        /// </summary>
        Task<TranslationJobResponse> StartTranslationAsync(
            Guid tenantId,
            Guid recordingId,
            Guid sourceTranscriptId,
            List<string> targetLanguages);

        /// <summary>
        /// Get all transcripts for a recording
        /// </summary>
        Task<List<SessionTranscriptDto>> GetTranscriptsAsync(
            Guid tenantId, 
            Guid recordingId);

        /// <summary>
        /// Edit a transcript segment
        /// </summary>
        Task<TranscriptEditDto> EditTranscriptSegmentAsync(
            Guid tenantId,
            EditTranscriptRequest request,
            Guid currentUserId);

        /// <summary>
        /// Get edit history for a transcript
        /// </summary>
        Task<List<TranscriptEditDto>> GetTranscriptEditsAsync(
            Guid tenantId,
            Guid transcriptId);
    }
}
