using Netocracy.Console.Business;
using System;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace Netocracy.Console.Console
{
    class Program
    {
        [Flags]
        public enum Mode { None, CreateIndividuals, GenerateTribes, CreateAndGenerate };

        static async Task Main(string[] args)
        {
            var mode = (Mode)GetArg(0, "mode", args);
            var stopwatch = new Stopwatch();
            var individuals =
                mode.HasFlag(Mode.CreateIndividuals)
                ? GenerateIndividuals(args, stopwatch)
                : Repository.LoadIndividuals();
            if (mode.HasFlag(Mode.GenerateTribes))
                await ComputeTribes(individuals, stopwatch);
        }

        private static Individual[] GenerateIndividuals(string[] args, Stopwatch stopwatch)
        {
            var count = GetArg(1, "count", args);
            var friends = GetArg(2, "friends", args);
            var foes = GetArg(3, "friends", args);
            var horizon = GetArg(4, "horizon", args);
            System.Console.WriteLine($"Generate {count} individuals with {friends} friends and {foes} foes each");
            stopwatch.Start();
            var individuals = IndividualComputer.GenerateIndividuals(count, friends, foes, horizon);
            stopwatch.Stop();
            System.Console.WriteLine($"Generating {count} individuals took {stopwatch.ElapsedMilliseconds} ms");
            Repository.SaveIndividuals(individuals);
            return individuals;
        }

        private static async Task ComputeTribes(Individual[] individuals, Stopwatch stopwatch)
        {
            stopwatch.Restart();
            var tribes = await TribeService.ComputeTribes(individuals);
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