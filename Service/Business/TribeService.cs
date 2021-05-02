using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Netocracy.Console.Business
{
    //https://docs.google.com/document/d/1a0LRTN9ta6nwODoeKM3mUHrLAL_PDSnsUVLHIWhLJcA/edit?usp=sharing
    public class TribeService
    {
        public Task<Tribe[]> ComputeTribes(params Individual[] individuals)
        {
            var calibrated = individuals.Select(IndividualComputer.Calibrate).ToDictionary(ind => ind.Id);
            var matchable = Gather(calibrated).ToDictionary(inh => inh.Id);
            var nextPairs = new List<Pair>();
            var currentPairs = matchable.Values.OrderByDescending(p => p.Popularity).ToList();
            var updated = true;
            var reroute = new Dictionary<int, int>();
            while (updated)
            {
                updated = false;
                var n = currentPairs.Count;
                for (var i = 0; i < n; i++)
                {
                    var next = currentPairs[i];
                    var threshold = next.LowerMatchThreshold;
                    var match = next.SortedPeers
                        .TakeWhile(p => p.Trust > threshold)
                        .Select(p => matchable.TryGetValue(p.TargetId, out var val) ? val : null)
                        .Where(p => p != null && CanMatchWith(p, next))
                        .FirstOrDefault();
                    if (match != null)
                    {
                        updated = true;
                        var pair = MergePairs(next, match);
                        nextPairs.Add(pair);
                        matchable.Remove(next.Id);
                        matchable.Remove(match.Id);
                        currentPairs.Remove(match);
                        n--;
                        reroute[match.Id] = pair.Id;
                    }
                    else
                    {
                        nextPairs.Add(next);
                        matchable.Remove(next.Id);
                    }
                }
                matchable = nextPairs.ToDictionary(p => p.Id);
                foreach (var m in matchable.Values)
                    m.SortedPeers = ReroutePeers(m.SortedPeers).ToArray();
                currentPairs = matchable.Values.OrderByDescending(p => p.Popularity).ToList();
                nextPairs.Clear();
                reroute.Clear();
            }
            return Task.FromResult(GenerateTribes(currentPairs, calibrated));

            IEnumerable<SortedPeer> ReroutePeers(IEnumerable<SortedPeer> peers)
                => peers
                .GroupBy(p => reroute.TryGetValue(p.TargetId, out var nt) ? nt : p.TargetId)
                .Select(g => new SortedPeer { TargetId = g.Key, Trust = g.Sum(p => p.Trust) })
                .OrderByDescending(p => p.Trust);
        }

        private static Pair MergePairs(Pair left, Pair right)
            => new()
            {
                Id = left.Id,
                Left = left,
                Right = right,
                LowerMatchThreshold = (left.LowerMatchThreshold + right.LowerMatchThreshold) / 2,
                UpperMatchThreshold = (left.UpperMatchThreshold + right.UpperMatchThreshold) / 2,
                Popularity = MergePopularity(left, right),
                SortedPeers = GetSorted(MergePeers(left, right))
            };

        private Tribe[] GenerateTribes(List<Pair> pairs, IDictionary<int, Individual> calibrated)
        {
            return pairs.Where(p => p.Left != null).Select(GenerateTribe).ToArray();

            Tribe GenerateTribe(Pair pair)
                => new()
                {
                    Id = $"{pair.Left.Id}-{pair.Right.Id}",
                    Members = CollectMembers(pair).ToArray()
                };

            IEnumerable<Individual> CollectMembers(Pair pair)
            {
                var stack = new Stack<Pair>(new[] { pair });
                do
                {
                    pair = stack.Pop();
                    if (pair.Left is null)
                        yield return calibrated[pair.Id];
                    else
                    {
                        stack.Push(pair.Right);
                        stack.Push(pair.Left);
                    }
                }
                while (stack.Any());
            }
        }

        private static IEnumerable<(int, float)> MergePeers(Pair next, Pair match)
            => next.SortedPeers.Where(p => p.TargetId != match.Id)
            .Concat(match.SortedPeers.Where(p => p.TargetId != next.Id))
            .GroupBy(p => p.TargetId)
            .Select(g => (g.Key, g.Sum(p => p.Trust)));

        private static float MergePopularity(Pair a, Pair b)
            => a.Popularity
                + b.Popularity
                - a.SortedPeers.Single(p => p.TargetId == b.Id).Trust
                - b.SortedPeers.Single(p => p.TargetId == a.Id).Trust;

        private static bool CanMatchWith(Pair subject, Pair target)
            => subject.SortedPeers
            .TakeWhile(p => p.Trust > subject.UpperMatchThreshold)
            .Any(p => p.TargetId == target.Id);

        private IEnumerable<Pair> Gather(Dictionary<int, Individual> calibrated)
        {
            return calibrated.Values
                .SelectMany(ci => ci.Peers)
                .GroupBy(p => p.TargetId)
                .Select(CreatePair)
                .Where(v => v != null);

            Pair CreatePair(IGrouping<int, Peer> fans)
                => calibrated.TryGetValue(fans.Key, out var individual)
                    ? new()
                    {
                        Id = individual.Id,
                        LowerMatchThreshold = individual.LowerMatchThreshold,
                        UpperMatchThreshold = individual.UpperMatchThreshold,
                        Popularity = fans.Sum(p => p.Trust),
                        SortedPeers = GetSorted(individual.Peers.Select(p => (p.TargetId, p.Trust)))
                    } : null;
        }

        private static SortedPeer[] GetSorted(IEnumerable<(int to, float trust)> trusts)
            => trusts.Select(t => new SortedPeer(t.to, t.trust)).OrderByDescending(p => p.Trust).ToArray();
    }
}