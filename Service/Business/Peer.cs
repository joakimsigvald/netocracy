using System;

namespace Netocracy.Console.Business
{
    public struct Peer : IEquatable<Peer>
    {
        public int TargetId { get; set; }
        public float Trust { get; set; }

        public bool Equals(Peer other)
            => other.TargetId == TargetId && other.Trust == Trust;

        public override bool Equals(object obj)
            => obj is Peer p && Equals(p);

        public override int GetHashCode() => TargetId;

        public static bool operator ==(Peer left, Peer right) => left.Equals(right);

        public static bool operator !=(Peer left, Peer right) => !(left == right);
    }
}