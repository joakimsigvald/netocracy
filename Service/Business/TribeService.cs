using System;
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
            var calibrated = individuals.ToDictionary(ind => ind.Id);
            var matchable = Gather(calibrated).ToDictionary(inh => inh.Id);
            var lastCount = 0;
            do
            {
                lastCount = matchable.Count;
                matchable = GeneratePairs(matchable);
            }
            while (lastCount > matchable.Count);
            return Task.FromResult(GenerateTribes(matchable.Values));
        }

        private static Dictionary<int, Pair> GeneratePairs(Dictionary<int, Pair> matchable)
        {
            var currentPairs = matchable.Values.OrderByDescending(p => p.Popularity).ToArray();
            var reroute = new Dictionary<int, int>();
            var n = currentPairs.Length;
            for (var i = 0; i < n; i++)
            {
                var next = currentPairs[i];
                if (next.IsMatched) continue;
                var (gallant, bride, mutualTrust) = FindMatch(next, matchable);
                if (bride != null)
                {
                    MergePairs(gallant, bride, mutualTrust);
                    reroute[bride.Id] = next.Id;
                    matchable.Remove(bride.Id);
                    bride.IsMatched = true;
                }
                matchable.Remove(next.Id);
            }
            matchable = currentPairs.Where(p => !p.IsMatched).ToDictionary(p => p.Id);
            foreach (var m in matchable.Values)
                m.SortedPeers = ReroutePeers(m.SortedPeers).ToArray();
            return matchable;

            IEnumerable<Peer> ReroutePeers(IEnumerable<Peer> peers)
                    => peers
                    .GroupBy(p => reroute.TryGetValue(p.TargetId, out var nt) ? nt : p.TargetId)
                    .Select(g => new Peer { TargetId = g.Key, Trust = g.Sum(p => p.Trust) })
                    .OrderByDescending(p => p.Trust);
        }

        private static (Pair gallant, Pair bride, float mutualTrust) FindMatch(Pair gallant, Dictionary<int, Pair> matchable)
        {
            var lowerThreshold = gallant.LowerMatchThreshold;
            foreach (var candidate in gallant.SortedPeers)
            {
                if (candidate.Trust <= lowerThreshold)
                    return default;
                var (bride, trust) = ProposeTo(candidate);
                if (bride != null)
                    return (gallant, bride, candidate.Trust + trust);
            }
            return default;

            (Pair bride, float trust) ProposeTo(Peer candidate)
            {
                if (!matchable.TryGetValue(candidate.TargetId, out var bride)) return default;
                var upperThreshold = bride.UpperMatchThreshold;
                foreach (var mutualTrust in bride.SortedPeers)
                {
                    var mutual = mutualTrust.Trust;
                    if (mutualTrust.TargetId == gallant.Id)
                        return mutual > upperThreshold ? (bride, mutual) : default;
                    else if (mutual <= upperThreshold)
                        return default;
                }
                return default;
            }
        }

        private static void MergePairs(Pair left, Pair right, float mutualTrust)
        {
            var newIndividuals = new Individual[left.Individuals.Length + right.Individuals.Length];
            Array.Copy(left.Individuals, newIndividuals, left.Individuals.Length);
            Array.Copy(right.Individuals, 0, newIndividuals, left.Individuals.Length, right.Individuals.Length);
            left.Individuals = newIndividuals;
            left.LowerMatchThreshold = (left.LowerMatchThreshold + right.LowerMatchThreshold) / 2;
            left.UpperMatchThreshold = (left.UpperMatchThreshold + right.UpperMatchThreshold) / 2;
            left.Popularity = left.Popularity + right.Popularity - mutualTrust;
            left.SortedPeers = MergePeers(left, right);
        }

        private static Peer[] MergePeers(Pair next, Pair match)
        {
            var dict = next.SortedPeers.Where(sp => sp.TargetId != match.Id).ToDictionary(sp => sp.TargetId);
            var rest = new List<Peer>();
            foreach (var sp in match.SortedPeers)
            {
                if (sp.TargetId == next.Id)
                    continue;
                if (dict.TryGetValue(sp.TargetId, out var val))
                    val.Trust += sp.Trust;
                else rest.Add(sp);
            }
            return dict.Values.Concat(rest).OrderByDescending(p => p.Trust).ToArray();
        }

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
                        Individuals = new[] { individual },
                        LowerMatchThreshold = individual.LowerMatchThreshold,
                        UpperMatchThreshold = individual.UpperMatchThreshold,
                        Popularity = fans.Sum(p => p.Trust),
                        SortedPeers = GetSorted(individual.Peers)
                    } : null;
        }

        private static Peer[] GetSorted(Peer[] peers)
            => peers.OrderByDescending(p => p.Trust).ToArray();

        private Tribe[] GenerateTribes(IEnumerable<Pair> pairs)
        {
            return pairs.Where(p => p.Individuals.Length > 1).Select(GenerateTribe).ToArray();

            Tribe GenerateTribe(Pair pair)
                => new()
                {
                    Id = $"{pair.Individuals[0].Id}-{pair.Individuals[1].Id}",
                    Members = pair.Individuals
                };
        }
    }
}