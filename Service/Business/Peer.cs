using System;

namespace Netocracy.Console.Business
{
    public struct Peer : IComparable<Peer>
    {
        public Peer(int targetId, float trust)
        {
            TargetId = targetId;
            Trust = trust;
        }

        public int TargetId { get; set; }
        public float Trust { get; set; }

        public int CompareTo(Peer other) => other.Trust.CompareTo(Trust);
    }
}