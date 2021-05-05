namespace Netocracy.Console.Business
{
    public class Pair
    {
        public int Id { get; set; }
        public bool IsMatched { get; set; }
        public Individual[] Individuals { get; set; }
        public float LowerMatchThreshold { get; set; }
        public float UpperMatchThreshold { get; set; }
        public Peer[] SortedPeers { get; set; }
        public float Popularity { get; set; }
    }
}