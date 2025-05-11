using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace backend.Services
{
    public class PermissionDataMigration : IHostedService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<PermissionDataMigration> _logger;

        public PermissionDataMigration(
            IServiceProvider serviceProvider,
            ILogger<PermissionDataMigration> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Starting permission data migration...");
            
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            
            // Get all roles with JSON permissions
            var roles = await dbContext.Roles.ToListAsync(cancellationToken);
            
            foreach (var role in roles)
            {
                try
                {
                    // Deserialize the JSON permissions
                    var permissionDtos = JsonSerializer.Deserialize<List<PermissionDto>>(role.Permissions) ?? new List<PermissionDto>();
                    
                    // Check if we already migrated this role's permissions
                    var existingPermissions = await dbContext.RolePermissions
                        .Where(rp => rp.RoleId == role.RoleId)
                        .ToListAsync(cancellationToken);
                        
                    if (existingPermissions.Any())
                    {
                        _logger.LogInformation($"Role {role.RoleName} (ID: {role.RoleId}) already has migrated permissions. Skipping.");
                        continue;
                    }
                    
                    // Migrate to the new format
                    var rolePermissions = new List<RolePermission>();
                    
                    foreach (var permission in permissionDtos)
                    {
                        var action = permission.Action.ToLower();
                        
                        var rolePermission = new RolePermission
                        {
                            RoleId = role.RoleId,
                            ModuleName = permission.ModuleName,
                            Action = action,
                            IsAllowed = permission.IsAllowed,
                            CanView = action == "view",
                            CanCreate = action == "create",
                            CanEdit = action == "edit",
                            CanDelete = action == "delete"
                        };
                        
                        rolePermissions.Add(rolePermission);
                    }
                    
                    if (rolePermissions.Any())
                    {
                        // Add the new permissions
                        dbContext.RolePermissions.AddRange(rolePermissions);
                        await dbContext.SaveChangesAsync(cancellationToken);
                        _logger.LogInformation($"Migrated {rolePermissions.Count} permissions for role {role.RoleName} (ID: {role.RoleId})");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error migrating permissions for role {role.RoleName} (ID: {role.RoleId})");
                }
            }
            
            _logger.LogInformation("Permission data migration completed");
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}