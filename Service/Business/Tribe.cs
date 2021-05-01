using System.Collections.Generic;
using System.Linq;

namespace Netocracy.Console.Business
{
    public class Tribe
    {
        public string Id { get; set; }
        public Inhabitant[] Members { get; set; }

        public override string ToString()
            => $"{Id}: {string.Join(", ", Members.Select(m => m.Individual.Id))}";
    }
}
