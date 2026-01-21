using Microsoft.EntityFrameworkCore.Diagnostics;
using System.Data.Common;

namespace AuthService.Context
{
    /// <summary>
    /// Interceptor that sets the tenant context before each database command
    /// This ensures Row-Level Security (RLS) policies work correctly
    /// </summary>
    public class TenantCommandInterceptor : DbCommandInterceptor
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TenantCommandInterceptor(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public override async ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result,
            CancellationToken cancellationToken = default)
        {
            await SetTenantContextAsync(command, cancellationToken);
            return await base.ReaderExecutingAsync(command, eventData, result, cancellationToken);
        }

        public override InterceptionResult<DbDataReader> ReaderExecuting(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result)
        {
            SetTenantContext(command);
            return base.ReaderExecuting(command, eventData, result);
        }

        public override async ValueTask<InterceptionResult<int>> NonQueryExecutingAsync(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default)
        {
            await SetTenantContextAsync(command, cancellationToken);
            return await base.NonQueryExecutingAsync(command, eventData, result, cancellationToken);
        }

        public override InterceptionResult<int> NonQueryExecuting(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<int> result)
        {
            SetTenantContext(command);
            return base.NonQueryExecuting(command, eventData, result);
        }

        private void SetTenantContext(DbCommand command)
        {
            var tenantId = GetCurrentTenantId();
            
            // Add a SET LOCAL command before the actual query
            var setTenantCommand = command.Connection?.CreateCommand();
            if (setTenantCommand != null)
            {
                setTenantCommand.CommandText = $"SET LOCAL app.current_tenant_id = '{tenantId}'";
                setTenantCommand.Transaction = command.Transaction;
                
                try
                {
                    if (command.Connection?.State == System.Data.ConnectionState.Open)
                    {
                        setTenantCommand.ExecuteNonQuery();
                    }
                }
                catch
                {
                    // Ignore errors - connection might not be open yet
                }
            }
        }

        private async Task SetTenantContextAsync(DbCommand command, CancellationToken cancellationToken)
        {
            var tenantId = GetCurrentTenantId();
            
            // Add a SET LOCAL command before the actual query
            var setTenantCommand = command.Connection?.CreateCommand();
            if (setTenantCommand != null)
            {
                setTenantCommand.CommandText = $"SET LOCAL app.current_tenant_id = '{tenantId}'";
                setTenantCommand.Transaction = command.Transaction;
                
                try
                {
                    if (command.Connection?.State == System.Data.ConnectionState.Open)
                    {
                        await setTenantCommand.ExecuteNonQueryAsync(cancellationToken);
                    }
                }
                catch
                {
                    // Ignore errors - connection might not be open yet
                }
            }
        }

        private Guid GetCurrentTenantId()
        {
            // Try HttpContext.Items (set during login)
            var tenantId = _httpContextAccessor?.HttpContext?.Items["TenantId"] as Guid?;
            
            // Try JWT claims (for authenticated API calls)
            if (tenantId == null)
            {
                var tenantIdClaim = _httpContextAccessor?.HttpContext?.User?.FindFirst("tenant_id")?.Value;
                if (!string.IsNullOrEmpty(tenantIdClaim) && Guid.TryParse(tenantIdClaim, out var parsedTenantId))
                {
                    tenantId = parsedTenantId;
                }
            }
            
            // Try X-Tenant-ID header
            if (tenantId == null)
            {
                var tenantIdHeader = _httpContextAccessor?.HttpContext?.Request.Headers["X-Tenant-ID"].FirstOrDefault();
                if (!string.IsNullOrEmpty(tenantIdHeader) && Guid.TryParse(tenantIdHeader, out var parsedTenantId))
                {
                    tenantId = parsedTenantId;
                }
            }
            
            return tenantId ?? Guid.Parse("11111111-1111-1111-1111-111111111111");
        }
    }
}
