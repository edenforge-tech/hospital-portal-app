using AuthService.Models.Search;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AuthService.Services
{
    public interface ISearchService
    {
        /// <summary>
        /// Execute a dynamic search across specified scope with criteria
        /// </summary>
        Task<SearchResultDto> ExecuteSearchAsync(ExecuteSearchRequest request, Guid tenantId, Guid userId);

        /// <summary>
        /// Save a search for later use
        /// </summary>
        Task<SavedSearchDto> SaveSearchAsync(CreateSavedSearchRequest request, Guid tenantId, Guid userId);

        /// <summary>
        /// Get user's saved searches
        /// </summary>
        Task<List<SavedSearchDto>> GetUserSavedSearchesAsync(Guid userId, Guid tenantId, SearchScope? scope = null);

        /// <summary>
        /// Get predefined search presets (23 common searches)
        /// </summary>
        Task<List<SearchPresetDto>> GetSearchPresetsAsync(SearchScope? scope = null);

        /// <summary>
        /// Delete a saved search
        /// </summary>
        Task<bool> DeleteSavedSearchAsync(Guid searchId, Guid userId, Guid tenantId);

        /// <summary>
        /// Get saved search by ID
        /// </summary>
        Task<SavedSearchDto?> GetSavedSearchByIdAsync(Guid searchId, Guid userId, Guid tenantId);

        /// <summary>
        /// Update favorite status of a saved search
        /// </summary>
        Task<bool> UpdateFavoriteStatusAsync(Guid searchId, bool isFavorite, Guid userId, Guid tenantId);

        /// <summary>
        /// Execute a saved search by ID
        /// </summary>
        Task<SearchResultDto> ExecuteSavedSearchAsync(Guid searchId, int pageNumber, int pageSize, Guid userId, Guid tenantId);
    }
}
