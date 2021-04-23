using System.Collections.Generic;
using System.Linq;

namespace Netocracy.Console.Business
{
    public class Tribe
    {
        public string Name { get; set; }
        public int Index { get; set; }
        public List<Inhabitant> Members { get; set; } = new List<Inhabitant>();
        public float FoundingBond { get; set; }

        public override string ToString()
            => $"{Name}: {string.Join(", ", Members.Select(m => m.Individual.Id))}";
    }
}
