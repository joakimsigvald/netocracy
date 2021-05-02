namespace Netocracy.Console.Business
{
    public class Pair
    {
        public int Id { get; set; }
        public Pair Left { get; set; }
        public Pair Right { get; set; }
        public float LowerMatchThreshold { get; set; }
        public float UpperMatchThreshold { get; set; }
        public SortedPeer[] SortedPeers { get; set; }
        public float Popularity { get; set; }
    }
}