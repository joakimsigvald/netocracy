using Netocracy.Console.Business;
using System.IO;

namespace Netocracy.Console.Console
{
    public static class Repository
    {
        private const string _filename = "individuals.txt";

        public static Individual[] LoadIndividuals()
        {
            var json = File.ReadAllText(_filename);
            return IndividualComputer.DeserializeIndividuals(json);
        }

        public static void SaveIndividuals(Individual[] individuals)
        {
            var json = IndividualComputer.SerializeIndividuals(individuals);
            File.WriteAllText(_filename, json);
        }
    }
}