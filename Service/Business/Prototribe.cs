namespace Netocracy.Console.Business
{
    public class Prototribe
    {
        public int Id { get; set; }
        public bool IsMatched { get; set; }
        public Individual[] Individuals { get; set; }
        public Peer[] SortedPeers { get; set; }
        public float Popularity { get; set; }
    }
}