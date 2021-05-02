using System;
using System.Linq;

namespace Netocracy.Console.Business
{
    public class Individual : IEquatable<Individual>
    {
        public Individual()
        {
        }

        public Individual(int id, params Peer[] peers)
        {
            Id = id;
            Peers = peers;
        }

        public int Id { get; set; }
        public float LowerMatchThreshold { get; set; }
        public float UpperMatchThreshold { get; set; }
        public Peer[] Peers { get; set; }

        public bool Equals(Individual other)
            => other != null && other.Id == Id && other.Peers.Select(p => p.TargetId).SequenceEqual(Peers.Select(p => p.TargetId));

        public override bool Equals(object obj)
            => obj is Individual ind && Equals(ind);

        public override int GetHashCode() => Id;

        public override string ToString() => $"{Id}";
    }
}