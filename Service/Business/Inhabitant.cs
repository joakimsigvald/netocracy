namespace Netocracy.Console.Business
{
    public class Inhabitant
    {
        public Individual Individual { get; set; }
        public float Popularity { get; set; }
        public Tribe Tribe { get; set; }
        public Peer[] SortedPeers { get; set; }
    }
}