using System;
using System.Collections.Generic;
using System.Linq;

namespace Netocracy.Console.Business
{
    public class Tribe2 {
        public Tribe2 Parent { get; set; }
        public string Name { get; set; }
        public Inhabitant2 Founder { get; set; }
        public float FoundingBond { get; set; }
        public Tribe2[] Children { get; set; } = Array.Empty<Tribe2>();

        public IEnumerable<Tribe2> GetAncestors()
            => (Parent is null ? Array.Empty<Tribe2>() : Parent.GetAncestors()).Append(this);

        public Tribe2 GetRoot() => Parent?.GetRoot() ?? this;

        public void CollectMembers(Tribe tribe)
        {
            if (Founder != null)
                tribe.Members.Add(CreateInhabitant(Founder, tribe));
            foreach (var child in Children)
                child.CollectMembers(tribe);
        }

        private static Inhabitant CreateInhabitant(Inhabitant2 founder, Tribe tribe)
            => new()
            {
                Individual = founder.Individual,
                Index = founder.Index,
                MembershipNumber = tribe.Members.Count,
                Tribe = tribe
            };
    }
}