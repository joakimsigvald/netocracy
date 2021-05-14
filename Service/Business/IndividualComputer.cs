using System;
using System.Collections.Generic;
using System.Linq;

namespace Netocracy.Console.Business
{
    public static class IndividualComputer
    {
        public static Individual[] GenerateIndividuals(int count, int friends, int foes, int horizon)
        {
            var relations = Enumerable.Range(0, count)
                .Select(i => GeneratePeers(i).ToList())
                .ToArray();
            for (var id = 1; id <= count; id++)
                foreach (var peer in relations[id - 1])
                    relations[peer.TargetId - 1].Add(new Peer(id, peer.Trust));
            return relations.Select(MapToIndividual).ToArray();

            IEnumerable<Peer> GeneratePeers(int n)
            {
                var n0 = Math.Min(n, horizon);
                var offset = n - n0;
                var n1 = Math.Min(friends, n0);
                var n2 = Math.Min(friends + foes, n0);
                var shifter = StocasticShifter(n);
                var stocasticPods = Enumerable.Range(offset, n0)
                    .Select(i => (o: shifter(i), i))
                    .OrderBy(t => t.o)
                    .Select(t => t.i + 1)
                    .ToArray();
                for (var i = 0; i < n1; i++)
                    yield return new Peer(stocasticPods[i], 1);
                for (var i = n1; i < n2; i++)
                    yield return new Peer(stocasticPods[i], -1);
            }
        }

        private static Individual MapToIndividual(List<Peer> peers, int index)
            => new(index + 1, ScalePeers(peers, 1f / peers.Count));

        private static Peer[] ScalePeers(List<Peer> peers, float factor)
            => peers.Select(p => p.WithTrust(p.Trust * factor)).ToArray();

        public static Individual Calibrate(Individual individual)
        {
            var peers = excludeSelf(individual.Peers);
            return new(individual.Id, CalibratePeers(peers).ToArray());

            Peer[] excludeSelf(Peer[] peers)
                => peers.Any(p => p.TargetId == individual.Id)
                ? peers.Where(p => p.TargetId != individual.Id).ToArray()
                : peers;
        }

        private static IEnumerable<Peer> CalibratePeers(IList<Peer> peers)
        {
            if (!peers.Any())
                return peers;
            var sumOfAbsoluteTrust = peers.Sum(p => Math.Abs(p.Trust));
            return sumOfAbsoluteTrust > 0 && sumOfAbsoluteTrust != 1
                ? CalibrateTrust(sumOfAbsoluteTrust)
                : peers;

            IEnumerable<Peer> CalibrateTrust(float sumOfAbsoluteTrust)
                => peers.Select(p => new Peer(p.TargetId, p.Trust / sumOfAbsoluteTrust));
        }

        public static Func<int, int> StocasticShifter(int count)
        {
            var nBits = (int)Math.Ceiling(Math.Log2(count));
            if (nBits < 2) return number => number;
            if (nBits % 2 == 1)
                nBits++;
            var halfBits = nBits / 2;
            var mid = 1 << halfBits;
            return number =>
            {
                var shifted = (number + 1) % count;
                var lower = (shifted % mid) << halfBits;
                var upper = shifted >> halfBits;
                return lower + upper;
            };
        }
    }
}