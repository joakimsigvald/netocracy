using System.Linq;

namespace Netocracy.Console.Business
{
    public class Tribe
    {
        public string Id { get; set; }
        public Individual[] Members { get; set; }
        public float Admiration { get; set; }

        public override string ToString() => $"{Id}: {string.Join(", ", Members.ToList())}";
    }
}
