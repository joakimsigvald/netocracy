using System;
using System.Linq;

namespace Netocracy.Console.Business
{
    public class Individual : IEquatable<Individual>
    {
        public int Id { get; set; }
        public Peer[] Peers { get; set; }

        public bool Equals(Individual other)
            => other != null && other.Id == Id && other.Peers.Select(p => p.Index).SequenceEqual(Peers.Select(p => p.Index));

        public override bool Equals(object obj)
            => obj is Individual ind && Equals(ind);

        public override int GetHashCode() => Id;
    }
}