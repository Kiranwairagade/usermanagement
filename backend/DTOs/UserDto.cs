using System;
using System.Collections.Generic;

namespace backend.DTOs
{
    public record UserDto(
        int UserId,
        string Username,
        string Email,
        string FirstName,
        string LastName,
        bool IsActive,
        DateTime CreatedAt,
        DateTime UpdatedAt,
        List<string> Permissions
    );

    public class CreateUserDto
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public List<UserPermissionDto>? UserPermissions { get; set; }
    }

    public class UpdateUserDto
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public List<UserPermissionDto>? UserPermissions { get; set; }
    }


    public class UpdateUserRequest
    {
        public string Username { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public List<UserPermissionDto> UserPermissions { get; set; } = new();
    }

    public class UsersResponse
    {
        public List<UserDetailDto> Users { get; set; } = new List<UserDetailDto>();
        public int TotalCount { get; set; }
    }

    public class UserDetailDto
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<string> Permissions { get; set; } = new List<string>();
        public UserDetailDto()
        {
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }
        public UserDetailDto(string username, string email, string firstName, string lastName, bool isActive, List<string> permissions)
        {
            Username = username;
            Email = email;
            FirstName = firstName;
            LastName = lastName;
            IsActive = isActive;
            Permissions = permissions;
        }
    }

    public class UserPermissionDto
    {
        public int UserId { get; set; }
        public string ModuleName { get; set; } = string.Empty;
        public bool CanCreate { get; set; }
        public bool CanRead { get; set; }
        public bool CanUpdate { get; set; }
        public bool CanDelete { get; set; }
    }

    public class CreateUserRequest
{
    public string Username { get; set; }
    public string Email { get; set; }
    // Add other necessary properties
    public string Password { get; set; }
    public string ConfirmPassword { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public bool IsActive { get; set; }
    public List<UserPermissionDto> UserPermissions { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public CreateUserRequest()
    {
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
    public CreateUserRequest(string username, string email, string password, string confirmPassword, string firstName, string lastName, bool isActive, List<UserPermissionDto> userPermissions)
    {
        Username = username;
        Email = email;
        Password = password;
        ConfirmPassword = confirmPassword;
        FirstName = firstName;
        LastName = lastName;
        IsActive = isActive;
        UserPermissions = userPermissions;
    }
}

}
