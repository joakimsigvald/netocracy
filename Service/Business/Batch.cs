namespace Netocracy.Console.Business
{
    public class Batch
    {
        public int FromX { get; set; }
        public int ToX { get; set; }
        public Peer[][] Friendships { get; set; }
        public Matrix CurrentGen { get; set; }
        public Matrix NextGen { get; set; }
    }
}