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
                m.SortedPeers = ReroutePeers(m.SortedPeers, reroute);
            return matchable;
        }

        private static Peer[] ReroutePeers(Peer[] peers, Dictionary<int, int> reroute)
        {
            var dict = new Dictionary<int, float>();
            foreach (var p in peers)
            {
                var newTargetId = reroute.TryGetValue(p.TargetId, out var nt) ? nt : p.TargetId;
                dict[newTargetId] = dict.TryGetValue(newTargetId, out var val) ? val + p.Trust : p.Trust;
            }
            var mergedPeers = dict.Select(t => new Peer(t.Key, t.Value)).ToArray();
            Array.Sort(mergedPeers);
            return mergedPeers;
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
            var dict = next.SortedPeers.ToDictionary(p => p.TargetId, p => p.Trust);
            var count = dict.Count;
            foreach (var p in match.SortedPeers)
            {
                var found = dict.TryGetValue(p.TargetId, out var val);
                if (found)
                {
                    if (val == -p.Trust)
                    {
                        dict.Remove(p.TargetId);
                        count--;
                    }
                    else
                    {
                        dict[p.TargetId] = val + p.Trust;
                    }
                }
                else if (val != -p.Trust)
                {
                    dict.Add(p.TargetId, p.Trust);
                    count++;
                }
            }
            if (dict.ContainsKey(next.Id))
            {
                dict.Remove(next.Id);
                count--;
            }
            if (dict.ContainsKey(match.Id))
            {
                dict.Remove(match.Id);
                count--;
            }
            var mergedPeers = new Peer[count];
            var i = 0;
            foreach (var t in dict)
            {
                mergedPeers[i++] = new Peer(t.Key, t.Value);
            }
            Array.Sort(mergedPeers);
            return mergedPeers;
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
        {
            Array.Sort(peers);
            return peers;
        }

        private Tribe[] GenerateTribes(IEnumerable<Pair> pairs)
        {
            return pairs.Where(p => p.Individuals.Length > 1).Select(GenerateTribe).ToArray();

            static Tribe GenerateTribe(Pair pair)
                => new()
                {
                    Id = $"{pair.Individuals[0].Id}-{pair.Individuals[1].Id}",
                    Members = pair.Individuals
                };
        }
    }
}