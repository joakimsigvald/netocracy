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
            for (var i = 0; i < 32; i++)
                matchable = GeneratePairs(matchable);
            var finalPairs = JoinTribes(matchable).ToArray();
            return Task.FromResult(GenerateTribes(finalPairs));
        }

        private static Dictionary<int, Prototribe> GeneratePairs(Dictionary<int, Prototribe> matchable)
        {
            var reroute = new Dictionary<int, int>();
            var nextPairs = new Dictionary<int, Prototribe>();
            var mergeActions = new Dictionary<int, Action>();
            foreach (var next in matchable.Values.OrderByDescending(p => p.Popularity))
            {
                if (next.IsMatched) continue;
                matchable.Remove(next.Id);
                nextPairs.Add(next.Id, next);
                var (gallant, bride, mutualTrust) = FindMatch(next, matchable);
                if (bride == null) continue;
                matchable.Remove(bride.Id);
                bride.IsMatched = true;
                reroute[bride.Id] = next.Id;
                mergeActions.Add(gallant.Id, () => MergePairs(gallant, bride, mutualTrust));
            }
            nextPairs.Values.AsParallel().ForAll(p =>
            {
                if (mergeActions.TryGetValue(p.Id, out var action))
                    action();
                p.SortedPeers = ReroutePeers(p.SortedPeers, reroute);
            });
            return nextPairs;
        }

        private static IEnumerable<Prototribe> JoinTribes(Dictionary<int, Prototribe> matchable)
        {
            foreach (var next in matchable.Values.OrderBy(p => p.Individuals.Length))
            {
                matchable.Remove(next.Id);
                var home = FindHome(next, matchable);
                if (home == null) yield return next;
                else MergeIndividuals(home, next);
            }
        }

        private static Peer[] ReroutePeers(Peer[] peers, Dictionary<int, int> reroute)
        {
            var dict = new Dictionary<int, float>();
            foreach (var p in peers)
                AddTrust(dict, reroute.TryGetValue(p.TargetId, out var nt) ? nt : p.TargetId, p.Trust);
            return GenerateMergedPeers(dict);
        }

        private static (Prototribe gallant, Prototribe bride, float mutualTrust) FindMatch(Prototribe gallant, Dictionary<int, Prototribe> matchable)
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

            (Prototribe bride, float trust) ProposeTo(Peer candidate)
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

        private static Prototribe FindHome(Prototribe visitor, Dictionary<int, Prototribe> matchable)
        {
            foreach (var candidate in visitor.SortedPeers)
            {
                if (candidate.Trust <= 0)
                    return null;
                var home = GetHome(candidate);
                if (home != null)
                    return home;
            }
            return null;

            Prototribe GetHome(Peer candidate)
            {
                if (!matchable.TryGetValue(candidate.TargetId, out var home)) 
                    return null;
                foreach (var peer in home.SortedPeers)
                {
                    if (peer.Trust <= 0)
                        return null;
                    if (peer.TargetId == visitor.Id)
                        return home;
                }
                return null;
            }
        }

        private static void MergePairs(Prototribe left, Prototribe right, float mutualTrust)
        {
            MergeIndividuals(left, right);
            MergePopularity(left, right, mutualTrust);
            left.SortedPeers = MergePeers(left, right);
        }

        private static void MergePopularity(Prototribe to, Prototribe from, float mutualTrust)
        {
            to.Popularity = to.Popularity + from.Popularity - mutualTrust;
        }

        private static void MergeIndividuals(Prototribe to, Prototribe from)
        {
            var newIndividuals = new Individual[to.Individuals.Length + from.Individuals.Length];
            Array.Copy(to.Individuals, newIndividuals, to.Individuals.Length);
            Array.Copy(from.Individuals, 0, newIndividuals, to.Individuals.Length, from.Individuals.Length);
            to.Individuals = newIndividuals;
        }

        private static Peer[] MergePeers(Prototribe next, Prototribe match)
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

        private static Dictionary<int, Prototribe> Gather(Dictionary<int, Individual> calibrated)
        {
            var dict = new Dictionary<int, Prototribe>();
            foreach (var ind in calibrated.Values)
                foreach (var p in ind.Peers)
                {
                    var id = p.TargetId;
                    if (dict.TryGetValue(id, out var val))
                        val.Popularity += p.Trust;
                    else if (calibrated.TryGetValue(id, out var member))
                    {
                        Array.Sort(member.Peers);
                        dict[id] = new()
                        {
                            Id = id,
                            Individuals = new[] { member },
                            Popularity = p.Trust,
                            SortedPeers = member.Peers
                        };
                    }
                }
            return dict;
        }

        private static Tribe[] GenerateTribes(IEnumerable<Prototribe> pairs)
        {
            return pairs.Where(p => p.Individuals.Length > 1).Select(GenerateTribe).ToArray();

            static Tribe GenerateTribe(Prototribe pair)
                => new()
                {
                    Id = $"{pair.Individuals[0].Id}-{pair.Individuals[1].Id}",
                    Members = pair.Individuals
                };
        }
    }
}