using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AuthService.Models.Counselor;
using AuthService.Services;
using AuthService.Authorization;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class InsuranceController : ControllerBase
    {
        private readonly IInsuranceWorkflowService _insuranceService;
        private readonly ILogger<InsuranceController> _logger;

        public InsuranceController(IInsuranceWorkflowService insuranceService, ILogger<InsuranceController> logger)
        {
            _insuranceService = insuranceService;
            _logger = logger;
        }

        private Guid GetTenantId()
        {
            var tenantIdClaim = User.FindFirst("TenantId")?.Value 
                             ?? User.FindFirst("tenant_id")?.Value;
            
            if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var tenantId))
            {
                throw new UnauthorizedAccessException("Tenant ID not found in user claims");
            }
            
            return tenantId;
        }
        
        private Guid GetCurrentUserId() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

        #region Pre-Authorization

        [HttpGet("pre-auths")]
        [RequirePermission("insurance.preauth.view")]
        public async Task<ActionResult<PreAuthListResponse>> GetAllPreAuths(
            [FromQuery] Guid? sessionId = null,
            [FromQuery] string? status = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 50)
        {
            var response = await _insuranceService.GetAllPreAuthsAsync(GetTenantId(), sessionId, status, pageNumber, pageSize);
            return Ok(response);
        }

        [HttpGet("pre-auths/{id}")]
        [RequirePermission("insurance.preauth.view")]
        public async Task<ActionResult<InsurancePreAuthDto>> GetPreAuthById(Guid id)
        {
            var preAuth = await _insuranceService.GetPreAuthByIdAsync(id, GetTenantId());
            if (preAuth == null) return NotFound(new { message = "Pre-authorization not found" });
            return Ok(preAuth);
        }

        [HttpPost("pre-auths")]
        [RequirePermission("insurance.preauth.create")]
        public async Task<ActionResult<InsurancePreAuthDto>> CreatePreAuth([FromBody] CreatePreAuthRequest request)
        {
            try
            {
                var preAuth = await _insuranceService.CreatePreAuthAsync(request, GetTenantId(), GetCurrentUserId());
                return CreatedAtAction(nameof(GetPreAuthById), new { id = preAuth.Id }, preAuth);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("pre-auths/{id}")]
        [RequirePermission("insurance.preauth.edit")]
        public async Task<ActionResult<InsurancePreAuthDto>> UpdatePreAuth(Guid id, [FromBody] UpdatePreAuthRequest request)
        {
            try
            {
                var preAuth = await _insuranceService.UpdatePreAuthAsync(id, request, GetTenantId(), GetCurrentUserId());
                return Ok(preAuth);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Pre-authorization not found" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("pre-auths/{id}/submit-tpa")]
        [RequirePermission("insurance.preauth.submit")]
        public async Task<ActionResult<InsurancePreAuthDto>> SubmitToTPA(Guid id, [FromBody] SubmitToTPARequest request)
        {
            try
            {
                var preAuth = await _insuranceService.SubmitToTPAAsync(id, request, GetTenantId(), GetCurrentUserId());
                return Ok(preAuth);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Pre-authorization not found" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("pre-auths/{id}/tpa-response")]
        [RequirePermission("insurance.preauth.process")]
        public async Task<ActionResult<InsurancePreAuthDto>> ProcessTPAResponse(Guid id, [FromBody] TPAResponseRequest request)
        {
            try
            {
                var preAuth = await _insuranceService.ProcessTPAResponseAsync(id, request, GetTenantId(), GetCurrentUserId());
                return Ok(preAuth);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Pre-authorization not found" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("pre-auths/{id}")]
        [RequirePermission("insurance.preauth.delete")]
        public async Task<IActionResult> DeletePreAuth(Guid id)
        {
            try
            {
                await _insuranceService.DeletePreAuthAsync(id, GetTenantId(), GetCurrentUserId());
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Pre-authorization not found" });
            }
        }

        #endregion

        #region Approval Workflow

        [HttpGet("pre-auths/{preAuthId}/workflow")]
        [RequirePermission("insurance.workflow.view")]
        public async Task<ActionResult<List<ApprovalWorkflowDto>>> GetWorkflowStages(Guid preAuthId)
        {
            var stages = await _insuranceService.GetWorkflowStagesAsync(preAuthId, GetTenantId());
            return Ok(stages);
        }

        [HttpPost("workflow/{workflowId}/process")]
        [RequirePermission("insurance.workflow.approve")]
        public async Task<ActionResult<ApprovalWorkflowDto>> ProcessApprovalStage(Guid workflowId, [FromBody] ProcessApprovalRequest request)
        {
            try
            {
                var workflow = await _insuranceService.ProcessApprovalStageAsync(workflowId, request, GetTenantId(), GetCurrentUserId());
                return Ok(workflow);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Workflow stage not found" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        #endregion

        #region Documents

        [HttpGet("pre-auths/{preAuthId}/documents")]
        [RequirePermission("insurance.documents.view")]
        public async Task<ActionResult<List<InsuranceDocumentDto>>> GetDocuments(Guid preAuthId)
        {
            var documents = await _insuranceService.GetPreAuthDocumentsAsync(preAuthId, GetTenantId());
            return Ok(documents);
        }

        [HttpPost("documents")]
        [RequirePermission("insurance.documents.upload")]
        public async Task<ActionResult<InsuranceDocumentDto>> UploadDocument([FromBody] UploadInsuranceDocumentRequest request)
        {
            var document = await _insuranceService.UploadDocumentAsync(request, GetTenantId(), GetCurrentUserId());
            return CreatedAtAction(nameof(GetDocuments), new { preAuthId = request.PreAuthId }, document);
        }

        [HttpPost("documents/{documentId}/verify")]
        [RequirePermission("insurance.documents.verify")]
        public async Task<ActionResult<InsuranceDocumentDto>> VerifyDocument(Guid documentId)
        {
            try
            {
                var document = await _insuranceService.VerifyDocumentAsync(documentId, GetTenantId(), GetCurrentUserId());
                return Ok(document);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Document not found" });
            }
        }

        [HttpDelete("documents/{documentId}")]
        [RequirePermission("insurance.documents.delete")]
        public async Task<IActionResult> DeleteDocument(Guid documentId)
        {
            try
            {
                await _insuranceService.DeleteDocumentAsync(documentId, GetTenantId());
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Document not found" });
            }
        }

        #endregion

        #region TPA Communication

        [HttpGet("pre-auths/{preAuthId}/communications")]
        [RequirePermission("insurance.tpa.view")]
        public async Task<ActionResult<List<TPACommunicationDto>>> GetCommunications(Guid preAuthId)
        {
            var communications = await _insuranceService.GetTPACommunicationsAsync(preAuthId, GetTenantId());
            return Ok(communications);
        }

        [HttpPost("communications")]
        [RequirePermission("insurance.tpa.log")]
        public async Task<ActionResult<TPACommunicationDto>> LogCommunication([FromBody] LogTPACommunicationRequest request)
        {
            var communication = await _insuranceService.LogCommunicationAsync(request, GetTenantId(), GetCurrentUserId());
            return CreatedAtAction(nameof(GetCommunications), new { preAuthId = request.PreAuthId }, communication);
        }

        [HttpPost("communications/{communicationId}/response")]
        [RequirePermission("insurance.tpa.respond")]
        public async Task<ActionResult<TPACommunicationDto>> RecordResponse(Guid communicationId, [FromBody] string responseText)
        {
            try
            {
                var communication = await _insuranceService.RecordResponseAsync(communicationId, responseText, GetTenantId());
                return Ok(communication);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Communication log not found" });
            }
        }

        #endregion
    }
}
