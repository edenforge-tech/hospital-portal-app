using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using AuthService.Models.Auth;

namespace AuthService.IntegrationTests.Helpers
{
    public class IntegrationTestHelper
    {
        private readonly HttpClient _client;
        private string _accessToken;
        private string _tenantId;

        public IntegrationTestHelper(HttpClient client)
        {
            _client = client;
        }

        public string AccessToken => _accessToken;
        public string TenantId => _tenantId;

        public async Task<bool> AuthenticateAsync(string username = "testadmin@hospital.com", string password = "Admin@123456")
        {
            var loginRequest = new
            {
                Email = username,
                Password = password
            };

            var content = new StringContent(
                JsonSerializer.Serialize(loginRequest),
                Encoding.UTF8,
                "application/json"
            );

            var response = await _client.PostAsync("/api/auth/login", content);
            
            if (!response.IsSuccessStatusCode)
            {
                return false;
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var loginResponse = JsonSerializer.Deserialize<LoginResponse>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            _accessToken = loginResponse.Token;
            _tenantId = loginResponse.TenantId;

            // Set default authorization header
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);
            _client.DefaultRequestHeaders.Add("X-Tenant-ID", _tenantId);

            return true;
        }

        public void SetAuthorizationHeader(string token = null)
        {
            if (string.IsNullOrEmpty(token))
            {
                token = _accessToken;
            }

            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        public void SetTenantHeader(string tenantId = null)
        {
            if (string.IsNullOrEmpty(tenantId))
            {
                tenantId = _tenantId;
            }

            _client.DefaultRequestHeaders.Remove("X-Tenant-ID");
            _client.DefaultRequestHeaders.Add("X-Tenant-ID", tenantId);
        }

        public void ClearAuthHeaders()
        {
            _client.DefaultRequestHeaders.Authorization = null;
            _client.DefaultRequestHeaders.Remove("X-Tenant-ID");
        }

        public async Task<HttpResponseMessage> GetAsync(string requestUri)
        {
            return await _client.GetAsync(requestUri);
        }

        public async Task<HttpResponseMessage> PostAsync<T>(string requestUri, T data)
        {
            var content = new StringContent(
                JsonSerializer.Serialize(data),
                Encoding.UTF8,
                "application/json"
            );

            return await _client.PostAsync(requestUri, content);
        }

        public async Task<HttpResponseMessage> PutAsync<T>(string requestUri, T data)
        {
            var content = new StringContent(
                JsonSerializer.Serialize(data),
                Encoding.UTF8,
                "application/json"
            );

            return await _client.PutAsync(requestUri, content);
        }

        public async Task<HttpResponseMessage> DeleteAsync(string requestUri)
        {
            return await _client.DeleteAsync(requestUri);
        }

        public async Task<TResponse> DeserializeResponse<TResponse>(HttpResponseMessage response)
        {
            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<TResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
    }

    public class LoginResponse
    {
        public string Token { get; set; }
        public string TenantId { get; set; }
        public string UserId { get; set; }
        public string Email { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
