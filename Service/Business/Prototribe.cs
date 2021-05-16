using System.Collections.Generic;
using System.Linq;

namespace Netocracy.Console.Business
{
    public class Prototribe
    {
        public int Id { get; set; }
        public bool IsMatched { get; set; }
        public Individual[] Individuals { get; set; }
        public Peer[] SortedPeers { get; set; }
        public IEnumerable<Peer> TrustedPeers => SortedPeers.TakeWhile(p => p.Trust > 0);
        public float Popularity { get; set; }
    }
}