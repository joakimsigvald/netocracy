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
            var relationComputer = new RelationComputer(10);
            var stopwatch = new Stopwatch();
            System.Console.WriteLine($"Generate {count} individuals with {friends} friends and {foes} foes each");
            stopwatch.Start();
            var individuals = IndividualComputer.GenerateIndividuals(count, friends, foes);
            stopwatch.Stop();
            System.Console.WriteLine($"Generating {count} individuals took {stopwatch.ElapsedMilliseconds} ms");

            stopwatch.Restart();
            var relations = await relationComputer.ComputeRelations(individuals);
            stopwatch.Stop();
            System.Console.WriteLine($"Computing relations took {stopwatch.ElapsedMilliseconds} ms");

            stopwatch.Restart();
            var connections = ConnectionComputer.ComputeConnections(relations);
            stopwatch.Stop();
            System.Console.WriteLine($"Computing connections took {stopwatch.ElapsedMilliseconds} ms");

            stopwatch.Restart();
            var tribes = TribeComputer.ComputeTribes(individuals, connections);
            stopwatch.Stop();
            System.Console.WriteLine($"Generating tribes took {stopwatch.ElapsedMilliseconds} ms");
            System.Console.WriteLine($"Generated {tribes.Length} tribes with sizes {string.Join(", ", tribes.Select(t => t.Members.Count))}");
        }

        private static int GetArg(int index, string name, string[] args)
            => int.TryParse(args.Skip(index).FirstOrDefault(), out var val)
            ? val
            : throw new ArgumentException($"Argument #{index} is {name}");
    }
}