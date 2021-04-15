using System.Collections.Generic;

namespace Console
{
    public class Tribe
    {
        public string Name { get; set; }
        public int Index { get; set; }
        public List<Individual> Members { get; set; }
        public float FoundingBond { get; set; }
    }
}
