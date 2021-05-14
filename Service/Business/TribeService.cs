using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Netocracy.Console.Business
{
    //https://docs.google.com/document/d/1a0LRTN9ta6nwODoeKM3mUHrLAL_PDSnsUVLHIWhLJcA/edit?usp=sharing
    public static class TribeService
    {
        public static Task<Tribe[]> ComputeTribes(params Individual[] individuals)
        {
            var calibrated = individuals.ToDictionary(ind => ind.Id);
            var matchable = Gather(calibrated);
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
                matchable.Remove(next.Id);
                var (gallant, bride, mutualTrust) = FindMatch(next, matchable);
                if (bride != null)
                {
                    if (bride.SortedPeers.Length == 1)
                    {
                        i--;
                        MergeIndividuals(gallant, bride);
                        MergePopularity(gallant, bride, mutualTrust);
                        gallant.SortedPeers = RemovePeer(gallant.SortedPeers, bride.Id);
                    }
                    else
                    {
                        MergePairs(gallant, bride, mutualTrust);
                    }
                    reroute[bride.Id] = next.Id;
                    matchable.Remove(bride.Id);
                    bride.IsMatched = true;
                }
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
                AddTrust(dict, reroute.TryGetValue(p.TargetId, out var nt) ? nt : p.TargetId, p.Trust);
            return GenerateMergedPeers(dict);
        }

        private static (Pair gallant, Pair bride, float mutualTrust) FindMatch(Pair gallant, Dictionary<int, Pair> matchable)
        {
            foreach (var candidate in gallant.SortedPeers)
            {
                if (candidate.Trust <= 0)
                    return default;
                var (bride, trust) = ProposeTo(candidate);
                if (bride != null)
                    return (gallant, bride, candidate.Trust + trust);
            }
            return default;

            (Pair bride, float trust) ProposeTo(Peer candidate)
            {
                if (!matchable.TryGetValue(candidate.TargetId, out var bride)) return default;
                foreach (var mutualTrust in bride.SortedPeers)
                {
                    if (mutualTrust.Trust <= 0)
                        return default;
                    if (mutualTrust.TargetId == gallant.Id)
                        return (bride, mutualTrust.Trust);
                }
                return default;
            }
        }

        private static void MergePairs(Pair left, Pair right, float mutualTrust)
        {
            MergeIndividuals(left, right);
            MergePopularity(left, right, mutualTrust);
            left.SortedPeers = MergePeers(left, right);
        }

        private static void MergePopularity(Pair to, Pair from, float mutualTrust)
        {
            to.Popularity = to.Popularity + from.Popularity - mutualTrust;
        }

        private static void MergeIndividuals(Pair to, Pair from)
        {
            var newIndividuals = new Individual[to.Individuals.Length + from.Individuals.Length];
            Array.Copy(to.Individuals, newIndividuals, to.Individuals.Length);
            Array.Copy(from.Individuals, 0, newIndividuals, to.Individuals.Length, from.Individuals.Length);
            to.Individuals = newIndividuals;
        }

        private static Peer[] MergePeers(Pair next, Pair match)
        {
            var dict = next.SortedPeers.ToDictionary(p => p.TargetId, p => p.Trust);
            foreach (var p in match.SortedPeers)
                AddTrust(dict, p.TargetId, p.Trust);
            if (dict.ContainsKey(next.Id))
                dict.Remove(next.Id);
            if (dict.ContainsKey(match.Id))
                dict.Remove(match.Id);
            return GenerateMergedPeers(dict);
        }

        private static Peer[] RemovePeer(Peer[] peers, int id)
        {
            var index = Array.FindIndex(peers, p => p.TargetId == id);
            var newPeers = new Peer[peers.Length - 1];
            if (index > 0)
                Array.Copy(peers, newPeers, index);
            if (index < newPeers.Length)
                Array.Copy(peers, index + 1, newPeers, index, newPeers.Length - index);
            return newPeers;
        }

        private static void AddTrust(Dictionary<int, float> mergedTrust, int targetId, float trust)
        {
            var found = mergedTrust.TryGetValue(targetId, out var val);
            if (found)
            {
                if (val == -trust)
                    mergedTrust.Remove(targetId);
                else
                    mergedTrust[targetId] = val + trust;
            }
            else if (val != -trust)
                mergedTrust.Add(targetId, trust);
        }

        private static Peer[] GenerateMergedPeers(Dictionary<int, float> mergedTrust)
        {
            var mergedPeers = new Peer[mergedTrust.Count];
            var i = 0;
            foreach (var t in mergedTrust)
            {
                mergedPeers[i++] = new Peer(t.Key, t.Value);
            }
            Array.Sort(mergedPeers);
            return mergedPeers;
        }

        private static Dictionary<int, Pair> Gather(Dictionary<int, Individual> calibrated)
        {
            var dict = new Dictionary<int, float>();
            foreach (var ind in calibrated.Values)
                foreach (var p in ind.Peers)
                {
                    var id = p.TargetId;
                    if (dict.TryGetValue(id, out var val))
                        dict[id] = val + p.Trust;
                    else if (calibrated.ContainsKey(id))
                        dict[id] = p.Trust;
                }
            var res = new KeyValuePair<int, Pair>[dict.Count];
            int i = 0;
            foreach (var t in dict)
            {
                var ind = calibrated[t.Key];
                Array.Sort(ind.Peers);
                res[i++] = new KeyValuePair<int, Pair>(t.Key, new()
                {
                    Id = ind.Id,
                    Individuals = new[] { ind },
                    Popularity = t.Value,
                    SortedPeers = ind.Peers
                });
            }
            return new Dictionary<int, Pair>(res);
        }

        private static Tribe[] GenerateTribes(IEnumerable<Pair> pairs)
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