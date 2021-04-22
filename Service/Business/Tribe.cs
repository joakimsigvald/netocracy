using System.Collections.Generic;

namespace Netocracy.Console.Business
{
    public class Tribe
    {
        public string Name { get; set; }
        public int Index { get; set; }
        public List<Inhabitant> Members { get; set; } = new List<Inhabitant>();
        public float FoundingBond { get; set; }
    }
}
