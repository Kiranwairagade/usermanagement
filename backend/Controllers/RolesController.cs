using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RolesController : ControllerBase
    {
        private readonly IRoleService _roleService;

        public RolesController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RoleDto>>> GetAllRoles()
        {
            var roles = await _roleService.GetAllRolesAsync();
            return Ok(roles);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RoleDto>> GetRole(int id)
        {
            var role = await _roleService.GetRoleByIdAsync(id);
            if (role == null) return NotFound();
            return Ok(role);
        }

        [HttpPost]
        public async Task<ActionResult<RoleDto>> CreateRole(CreateRoleDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var createdRole = await _roleService.CreateRoleAsync(dto);
                return CreatedAtAction(nameof(GetRole), new { id = createdRole.RoleId }, createdRole);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<RoleDto>> UpdateRole(int id, UpdateRoleDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var updatedRole = await _roleService.UpdateRoleAsync(id, dto);
                if (updatedRole == null) return NotFound();
                return Ok(updatedRole);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteRole(int id)
        {
            var result = await _roleService.DeleteRoleAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpGet("users/{userId}")]
        public async Task<ActionResult<IEnumerable<UserRoleDto>>> GetUserRoles(int userId)
        {
            var userRoles = await _roleService.GetUserRolesAsync(userId);
            return Ok(userRoles);
        }

        [HttpPost("users/assign")]
        public async Task<ActionResult<UserRoleDto>> AssignRoleToUser(AssignUserRoleDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var userRole = await _roleService.AssignRoleToUserAsync(dto);
                if (userRole == null) return NotFound("User or role not found or already assigned");
                return Ok(userRole);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("users/roles/{userRoleId}")]
        public async Task<ActionResult> RemoveRoleFromUser(int userRoleId)
        {
            var result = await _roleService.RemoveRoleFromUserAsync(userRoleId);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}