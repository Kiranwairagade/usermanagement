using Microsoft.EntityFrameworkCore;
using backend.Models;
using System.Linq;
using System.Collections.Generic;

namespace backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // DbSet properties for your entities
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<UserPermission> UserPermissions { get; set; } = null!;
        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; } = null!;
        public DbSet<Brand> Brands { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
   
// Add Role related DbSets
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<ActivityLog> ActivityLogs { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Ensure 'Category' maps to the correct table name
            modelBuilder.Entity<Category>().ToTable("ProductCategories");

            // Configure Permissions as a comma-separated string in the database
            modelBuilder.Entity<User>()
                .Property(u => u.Permissions)
                .HasConversion(
                    v => string.Join(',', v), // Convert List to string
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() // Convert string back to List
                );

            // Set up relationship between User and UserPermission
            modelBuilder.Entity<UserPermission>()
                .HasKey(up => new { up.UserId, up.ModuleName }); // Composite Key

            modelBuilder.Entity<UserPermission>()
                .HasOne(up => up.User)
                .WithMany(u => u.UserPermissions)
                .HasForeignKey(up => up.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure UserRole relationship
            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.User)
                .WithMany()
                .HasForeignKey(ur => ur.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(ur => ur.RoleId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure RolePermission relationship
            modelBuilder.Entity<RolePermission>()
                .HasOne(rp => rp.Role)
                .WithMany(r => r.RolePermissions)
                .HasForeignKey(rp => rp.RoleId)
                .OnDelete(DeleteBehavior.Cascade);

                // Configure ActivityLog
            modelBuilder.Entity<ActivityLog>(entity =>
            {
                entity.HasIndex(e => e.DateTime);
                entity.HasIndex(e => e.UserEmail);
                entity.HasIndex(e => e.Module);
                entity.Property(e => e.DateTime).HasDefaultValueSql("GETDATE()");
            });
        }
    }
}
