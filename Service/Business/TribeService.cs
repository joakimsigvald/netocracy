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
                var (match, mutualTrust) = FindMatch(next, matchable);
                if (match == null) continue;
                matchable.Remove(match.Id);
                match.IsMatched = true;
                reroute[match.Id] = next.Id;
                mergeActions.Add(next.Id, () => MergePairs(next, match, mutualTrust));
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

        private static (Prototribe match, float mutualTrust) FindMatch(Prototribe gallant, Dictionary<int, Prototribe> matchable)
        {
            return gallant.TrustedPeers
                .Select(ProposeTo)
                .FirstOrDefault(res => res.match != null);

            (Prototribe match, float mutualTrust) ProposeTo(Peer outgoing)
            {
                if (!matchable.TryGetValue(outgoing.TargetId, out var candidate))
                    return default;
                var incoming = candidate.TrustedPeers
                    .FirstOrDefault(p => p.TargetId == gallant.Id);
                return incoming.TargetId == 0 ? default : (candidate, outgoing.Trust + incoming.Trust);
            }
        }

        private static Prototribe FindHome(Prototribe visitor, Dictionary<int, Prototribe> matchable)
        {
            return visitor.TrustedPeers
                .Select(GetHome)
                .FirstOrDefault(home => home != null);

            Prototribe GetHome(Peer candidate)
                => matchable.TryGetValue(candidate.TargetId, out var home)
                && home.TrustedPeers.Any(p => p.TargetId == visitor.Id)
                    ? home
                    : null;
        }

        private static void MergePairs(Prototribe left, Prototribe right, float mutualTrust)
        {
            left.Individuals = MergeIndividuals(left, right);
            left.Popularity = MergePopularity(left, right, mutualTrust);
            left.SortedPeers = MergePeers(left, right);
        }

        private static float MergePopularity(Prototribe to, Prototribe from, float mutualTrust)
            => to.Popularity + from.Popularity - mutualTrust;

        private static Individual[] MergeIndividuals(Prototribe to, Prototribe from)
        {
            var newIndividuals = new Individual[to.Individuals.Length + from.Individuals.Length];
            Array.Copy(to.Individuals, newIndividuals, to.Individuals.Length);
            Array.Copy(from.Individuals, 0, newIndividuals, to.Individuals.Length, from.Individuals.Length);
            return newIndividuals;
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
            if (!mergedTrust.TryGetValue(targetId, out var val))
                mergedTrust.Add(targetId, trust);
            else if (val == -trust)
                mergedTrust.Remove(targetId);
            else
                mergedTrust[targetId] = val + trust;
        }

        private static Peer[] GenerateMergedPeers(Dictionary<int, float> mergedTrust)
        {
            var mergedPeers = new Peer[mergedTrust.Count];
            var i = 0;
            foreach (var t in mergedTrust)
                mergedPeers[i++] = new Peer(t.Key, t.Value);
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