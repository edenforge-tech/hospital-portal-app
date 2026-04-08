// Test Drug Interaction Checking
// Run this in the AuthService project
using AuthService.Context;
using AuthService.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

// Create DbContext
var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
optionsBuilder.UseNpgsql("Host=hospitalportal-db-server.postgres.database.azure.com;Port=5432;Database=hospitalportal;Username=postgres;Password=NewPass@2026!;SSL Mode=Require;Trust Server Certificate=true;");

using var context = new AppDbContext(optionsBuilder.Options);
using var loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
var logger = loggerFactory.CreateLogger<DrugInteractionService>();

var service = new DrugInteractionService(context, logger);

// Test 1: Critical interaction - Timolol + Asthma
Console.WriteLine("Test 1: Timolol + Asthma (should show Critical interaction)");
var test1 = await service.CheckInteractionsAsync(new List<string> { "Timolol 0.5%", "Asthma/COPD History" });
Console.WriteLine($"Has Interactions: {test1.HasInteractions}");
foreach (var interaction in test1.Interactions)
{
    Console.WriteLine($"  - {interaction.Drug1Name} + {interaction.Drug2Name}: {interaction.Severity}");
    Console.WriteLine($"    {interaction.Description}");
}

// Test 2: Duplicate prostaglandin
Console.WriteLine("\nTest 2: Latanoprost + Bimatoprost (duplicate prostaglandin)");
var test2 = await service.CheckInteractionsAsync(new List<string> { "Latanoprost 0.005%", "Bimatoprost 0.03%" });
Console.WriteLine($"Has Interactions: {test2.HasInteractions}");
foreach (var interaction in test2.Interactions)
{
    Console.WriteLine($"  - {interaction.Drug1Name} + {interaction.Drug2Name}: {interaction.Severity}");
}

// Test 3: Steroid + Herpes
Console.WriteLine("\nTest 3: Prednisolone + Herpes Keratitis (Critical contraindication)");
var test3 = await service.CheckInteractionsAsync(new List<string> { "Prednisolone Acetate 1%", "Herpes Simplex Keratitis (Active)" });
Console.WriteLine($"Has Interactions: {test3.HasInteractions}");
foreach (var interaction in test3.Interactions)
{
    Console.WriteLine($"  - {interaction.Drug1Name} + {interaction.Drug2Name}: {interaction.Severity}");
    Console.WriteLine($"    {interaction.Description}");
}

Console.WriteLine("\n✅ Drug interaction testing complete");
