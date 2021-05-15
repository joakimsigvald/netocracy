using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

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
                    => peers
                    .Select(p => new Peer(p.TargetId, p.Trust *= factor))
                    .OrderBy(p => p.TargetId)
                    .ToArray();

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

        public static string SerializeIndividuals(Individual[] individuals)
            => string.Join('\n', individuals.Select(Serialize));

        public static Individual[] DeserializeIndividuals(string str)
            => str.Split('\n').Select(Deserialize).ToArray();

        public static string Serialize(Individual individual)
            => $"{individual.Id}:{Serialize(individual.Peers)}";

        public static string Serialize(Peer[] peers)
        {
            var f = peers.Min(p => Math.Abs(p.Trust));
            var trust = peers
                .Select(p => (id: p.TargetId, trust: (int)Math.Round(p.Trust / f)))
                .OrderBy(t => t.id)
                .ToArray();
            var sb = new StringBuilder();
            var prevId = 0;
            foreach (var t in trust)
            {
                var s = t.trust > 0 ? $"+{t.trust}" : $"{t.trust}";
                sb.Append($",{t.id - prevId}{s}");
                prevId = t.id;
            }
            return sb.ToString()[1..];
        }

        public static Individual Deserialize(string str)
        {
            var parts = str.Split(':');
            var id = int.Parse(parts[0]);
            var peers = DeserializePeers(parts[1]).ToArray();
            return Calibrate(new Individual(id, peers));
        }

        private static IEnumerable<Peer> DeserializePeers(string str)
        {
            var prevId = 0;
            foreach (var t in str.Split(','))
            {
                var parts = t.Split('+');
                if (parts.Length == 2)
                    yield return new Peer(prevId = int.Parse(parts[0]) + prevId, int.Parse(parts[1]));
                else
                {
                    parts = t.Split('-');
                    yield return new Peer(prevId = int.Parse(parts[0]) + prevId, -int.Parse(parts[1]));
                }
            }
        }
    }
}