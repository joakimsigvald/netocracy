using Netocracy.Console.Business;
using System;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace Netocracy.Console.Console
{
    class Program
    {
        static async Task Main(string[] args)
        {
            var count = GetArg(0, "count", args);
            var friends = GetArg(1, "friends", args);
            var foes = GetArg(2, "friends", args);
            var stopwatch = new Stopwatch();
            System.Console.WriteLine($"Generate {count} individuals with {friends} friends and {foes} foes each");
            stopwatch.Start();
            var individuals = IndividualComputer.GenerateIndividuals(count, friends, foes);
            stopwatch.Stop();
            System.Console.WriteLine($"Generating {count} individuals took {stopwatch.ElapsedMilliseconds} ms");
            stopwatch.Restart();
            var service = new TribeService();
            var tribes = await service.ComputeTribes(individuals);
            stopwatch.Stop();
            System.Console.WriteLine($"Generating tribes took {stopwatch.ElapsedMilliseconds} ms");
            System.Console.WriteLine($"Generated {tribes.Length} tribes with sizes {string.Join(", ", tribes.Select(t => t.Members.Length))}");
        }

        private static int GetArg(int index, string name, string[] args)
            => int.TryParse(args.Skip(index).FirstOrDefault(), out var val)
            ? val
            : throw new ArgumentException($"Argument #{index} is {name}");
    }
}