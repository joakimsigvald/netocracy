using System;
using System.Collections.Generic;
using System.Linq;

namespace Netocracy.Console.Business
{
    public class TribeComputer2
    {
        public static Tribe[] ComputeTribes(params Individual[] individuals)
        {
            var tribes = new Dictionary<string, Tribe2>();
            var calibrated = individuals.Select(IndividualComputer.Calibrate).ToArray();
            var inhabitants = calibrated
                .Select((ind, i) => new Inhabitant2 { Index = i, Individual = ind })
                .ToDictionary(m => m.Index);
            var relations = GetTrust(calibrated)
                .OrderByDescending(t => t.w)
                .ThenBy(t => t.x)
                .ToArray();
            foreach (var (x, y, w) in relations)
            {
                var a = inhabitants[x];
                var b = inhabitants[y];
                var ta = a.Tribe ?? addTribe(a);
                var tb = b.Tribe ?? addTribe(b);
                var ancestorsA = ta.GetAncestors().ToArray();
                var ancestorsB = tb.GetAncestors().ToArray();
                var commonAncestor = GetCommon(ancestorsA, ancestorsB);
                if (w > 0)
                    commonAncestor ??= mergeTribes(a, b);
                else if (commonAncestor is null)
                    break;
                commonAncestor.FoundingBond += w;
                if (commonAncestor.FoundingBond <= 0)
                    splitTribe(commonAncestor);
            }
            return tribes.Values
                .Where(t => t.Parent == null)
                .OrderByDescending(t => t.FoundingBond)
                .Select(CreateTribe).ToArray();

            Tribe2 addTribe(Inhabitant2 founder)
            {
                var tribe = new Tribe2 { Name = $"{founder.Individual.Id}" };
                tribes[tribe.Name] = tribe;
                tribe.Founder = founder;
                founder.Tribe = tribe;
                return tribe;
            }

            Tribe2 mergeTribes(Inhabitant2 a, Inhabitant2 b)
            {
                var tribe = new Tribe2 { Name = $"{a.Individual.Id}-{b.Individual.Id}" };
                tribes[tribe.Name] = tribe;
                var at = a.Tribe.GetRoot();
                var bt = b.Tribe.GetRoot();
                at.Parent = tribe;
                bt.Parent = tribe;
                tribe.Children = new[] { at, bt };
                return tribe;
            }

            void splitTribe(Tribe2 tribe)
            {
                if (tribe == null) return;
                foreach (var child in tribe.Children)
                    child.Parent = null;
                tribe.Children = Array.Empty<Tribe2>();
                splitTribe(tribe.Parent);
                tribes.Remove(tribe.Name);
            }
        }

        private static Tribe CreateTribe(Tribe2 t, int i)
        {
            var tribe = new Tribe
            {
                FoundingBond = t.FoundingBond,
                Index = i,
                Name = t.Name
            };
            t.CollectMembers(tribe);
            return tribe;
        }

        private static Tribe2 GetCommon(Tribe2[] ancestorsA, Tribe2[] ancestorsB)
        {
            var firstA = ancestorsA.FirstOrDefault();
            var firstB = ancestorsB.FirstOrDefault();
            return firstA != null && firstA == firstB ? (GetCommon(ancestorsA[1..], ancestorsB[1..]) ?? firstA) : null;
        }

        private static IEnumerable<(int x, int y, float w)> GetTrust(Individual[] individuals)
        {
            for (var x = 0; x < individuals.Length; x++)
                foreach (var peer in individuals[x].Peers)
                    yield return (x, peer.Index, peer.Trust);
        }
    }
}