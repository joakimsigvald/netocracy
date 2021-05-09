using Netocracy.Console.Business;
using System.IO;
using System.Text.Json;

namespace Netocracy.Service.Console
{
    public static class Repository
    {
        private const string _filename = "individuals.json";

        public static Individual[] LoadIndividuals()
        {
            var json = File.ReadAllText(_filename);
            return JsonSerializer.Deserialize<Individual[]>(json);
        }

        public static void SaveIndividuals(Individual[] individuals)
        {
            var json = JsonSerializer.Serialize(individuals);
            File.WriteAllText(_filename, json);
        }
    }
}