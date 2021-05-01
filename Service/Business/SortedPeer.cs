namespace Netocracy.Console.Business
{
    public struct SortedPeer
    {
        public SortedPeer(string targetId, float trust)
        {
            TargetId = targetId;
            Trust = trust;
        }

        public string TargetId { get; set; }
        public float Trust { get; set; }
    }
}