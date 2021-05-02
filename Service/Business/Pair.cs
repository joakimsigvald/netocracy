using System.Collections.Generic;
using System.Linq;

namespace Netocracy.Console.Business
{
    public class Pair
    {
        public int Id { get; set; }
        public Pair Left { get; set; }
        public Pair Right { get; set; }
        public Individual Individual { get; set; }
        public float LowerMatchThreshold { get; set; }
        public float UpperMatchThreshold { get; set; }
        public SortedPeer[] SortedPeers { get; set; }
        public float Popularity { get; set; }
        public IEnumerable<Individual> Members 
            => Individual is null ? Left.Members.Concat(Right.Members) : new[] { Individual };
    }
}