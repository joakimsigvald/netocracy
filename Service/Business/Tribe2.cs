using System;
using System.Collections.Generic;
using System.Linq;

namespace Netocracy.Console.Business
{
    public class Tribe2
    {
        public static Tribe2[] Workbench;

        public Tribe2 Parent { get; set; }
        public string Name { get; set; }
        public Inhabitant2 Founder { get; set; }
        public float FoundingBond { get; set; }
        public Tribe2[] Children { get; set; } = Array.Empty<Tribe2>();

        public Tribe2[] GetAncestors()
        {
            var next = this;
            var i = 0;
            do
            {
                Workbench[i] = next;
                next = next.Parent;
                i++;
            } while (next != null);
            var res = new Tribe2[i];
            for (var j = i - 1; j >= 0; j--)
                res[i - j - 1] = Workbench[j];
            return res;
        }

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