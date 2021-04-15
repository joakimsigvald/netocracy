using System;
using System.Collections.Generic;
using System.Linq;

namespace Console
{
    public class TribeComputer
    {
        public static Tribe[] ComputeTribes(Individual[] individuals, float[][] connections)
        {
            var tribes = new List<Tribe>();
            foreach (var ind in individuals)
                SetMembership(ind, null, 0);
            foreach (var (x, y, strength) in ConnectionComputer.OrderByDecreasingStrength(connections))
            {
                var first = individuals[x];
                var second = individuals[y];
                if (first.Tribe is null)
                {
                    if (second.Tribe is null)
                    {
                        CreateTribe(first, second);
                    }
                    else
                    {
                        TryJoinTribe(first, second.Tribe);
                    }
                }
                else
                {
                    if (second.Tribe is null)
                    {
                        TryJoinTribe(second, first.Tribe);
                    }
                    else if (first.Tribe != second.Tribe)
                    {
                        TryMergeTribes(first, second);
                    }
                }
            }
            for (var i = 0; i < tribes.Count; i++)
                tribes[i].Index = i;
            return tribes.OrderByDescending(GetDominance).ToArray();

            bool AreConnected(Individual first, Individual second)
                => first.Index < second.Index
                    ? AreConnected(second, first)
                    : connections[first.Index][second.Index] > 0;

            bool CanJoinTribe(Individual aspiringMember, Tribe tribe)
                => tribe.Members.All(member => AreConnected(aspiringMember, member));

            void TryJoinTribe(Individual aspiringMember, Tribe tribe)
            {
                if (!CanJoinTribe(aspiringMember, tribe))
                    return;
                tribe.Members.Add(aspiringMember);
                SetMembership(aspiringMember, tribe, tribe.Members.Count);
            }

            void TryMergeTribes(Individual first, Individual second)
            {
                var dominantTribe = GetDominantTribe(first.Tribe, second.Tribe);
                var secondaryTribe = dominantTribe == first.Tribe ? second.Tribe : first.Tribe;
                var allMembers = dominantTribe.Members.Concat(secondaryTribe.Members).ToArray();
                if (!CanFormOneTribe(allMembers))
                    return;
                tribes.Remove(first.Tribe);
                tribes.Remove(second.Tribe);
                CreateTribe(allMembers);
            }

            bool CanFormOneTribe(Individual[] aspiringMembers)
            {
                var indices = aspiringMembers
                    .Select(m => m.Index).ToArray()
                    .OrderBy(i => i)
                    .ToArray();
                var n = indices.Length;
                for (var x = 1; x < n; x++)
                    for (var y = 0; y < x; y++)
                        if (connections[indices[x]][indices[y]] == 0)
                            return false;
                return true;
            }

            (int, float) GetDominance(Tribe tribe) => (tribe.Members.Count, tribe.FoundingBond);

            Tribe GetDominantTribe(Tribe tribe1, Tribe tribe2)
            {
                if (tribe1.Members.Count > tribe2.Members.Count)
                    return tribe1;
                if (tribe2.Members.Count > tribe1.Members.Count)
                    return tribe2;
                return tribe1.FoundingBond > tribe2.FoundingBond ? tribe1 : tribe2;
            }

            float GetFoundingBond(params Individual[] members)
            {
                var ind1 = members[0];
                var ind2 = members[1];
                return Math.Max(connections[ind1.Index][ind2.Index], connections[ind2.Index][ind1.Index]);
            }

            void CreateTribe(params Individual[] members)
            {
                var tribe = new Tribe
                {
                    Name = $"{members[0].Id}-{members[1].Id}",
                    Members = members.ToList(),
                    FoundingBond = GetFoundingBond(members)
                };
                for (var i = 0; i < members.Length; i++)
                    SetMembership(members[i], tribe, i + 1);
                tribes.Add(tribe);
            }
        }

        private static void SetMembership(Individual member, Tribe tribe, int n)
        {
            member.Tribe = tribe;
            member.MembershipNumber = n;
        }
    }
}