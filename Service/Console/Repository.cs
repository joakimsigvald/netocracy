using Netocracy.Console.Business;
using System.IO;

namespace Netocracy.Console.Console
{
    public static class Repository
    {
        public static Individual[] LoadIndividuals(int count)
        {
            var json = File.ReadAllText(Filename(count));
            return IndividualComputer.DeserializeIndividuals(json);
        }

        public static void SaveIndividuals(Individual[] individuals)
        {
            var json = IndividualComputer.SerializeIndividuals(individuals);
            File.WriteAllText(Filename(individuals.Length), json);
        }

        private static string Filename(int count) => $"individuals{count}.txt";
    }
}