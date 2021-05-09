using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Netocracy.Console.Business
{
    //https://docs.google.com/document/d/1a0LRTN9ta6nwODoeKM3mUHrLAL_PDSnsUVLHIWhLJcA/edit?usp=sharing
    public class TribeComputer
    {
        private IDictionary<int, List<Peer>> _incomingTrust;
        private IDictionary<int, List<Peer>> _outgoingTrust;
        private IDictionary<int, Pair> _pairLookup;
        private Pair[] _pairs;

        public static Task<Tribe[]> ComputeTribes(Individual[] individuals)
        {
            var computer = new TribeComputer(individuals);
            return computer.Compute();
        }

        private TribeComputer(Individual[] individuals)
            => Gather(individuals.ToDictionary(ind => ind.Id));

        private Task<Tribe[]> Compute()
        {
            int lastCount;
            do
            {
                lastCount = _pairs.Length;
                GeneratePairs();
            }
            while (lastCount > _pairs.Length);
            return Task.FromResult(GenerateTribes());
        }

        private void GeneratePairs()
        {
            var n = _pairs.Length;
            var skip = 0;
            for (var i = 0; i < n; i++)
            {
                var next = _pairs[i];
                if (next.Popularity == float.MinValue) continue;
                var (gallant, bride, mutualTrust) = FindMatch(next);
                if (bride != null)
                {
                    MergePairs(gallant, bride, mutualTrust);
                    skip++;
                }
            }
            Array.Sort(_pairs);
            _pairs = _pairs[..^skip];
        }

        private (Pair gallant, Pair bride, float mutualTrust) FindMatch(Pair gallant)
        {
            var outgoing = _outgoingTrust[gallant.Id];
            foreach (var candidate in outgoing)
            {
                if (candidate.Trust <= 0)
                    return default;
                var (bride, trust) = ProposeTo(candidate);
                if (bride != null)
                    return gallant.Individuals.Length < bride.Individuals.Length
                        ? (bride, gallant, candidate.Trust + trust)
                        : (gallant, bride, candidate.Trust + trust);
            }
            return default;

            (Pair bride, float trust) ProposeTo(Peer candidate)
            {
                var candidateTrust = _outgoingTrust[candidate.TargetId];
                foreach (var mutualTrust in candidateTrust)
                {
                    if (mutualTrust.Trust <= 0)
                        return default;
                    if (mutualTrust.TargetId == gallant.Id)
                        return (_pairLookup[candidate.TargetId], mutualTrust.Trust);
                }
                return default;
            }
        }

        private void MergePairs(Pair left, Pair right, float mutualTrust)
        {
            MergeIndividuals(left, right);
            MergePopularity(left, right, mutualTrust);
            MergeTrust(left.Id, right.Id);
            _pairLookup.Remove(right.Id);
        }

        private static void MergePopularity(Pair left, Pair right, float mutualTrust)
        {
            left.Popularity = left.Popularity + right.Popularity - mutualTrust;
            right.Popularity = float.MinValue;
        }

        private void MergeTrust(int leftId, int rightId)
        {
            var rebindIncoming = MergeTrust(_outgoingTrust, leftId, rightId);
            var rebindOutgoing = MergeTrust(_incomingTrust, leftId, rightId);
            RebindTrust(leftId, rightId, rebindIncoming, _incomingTrust, false);
            RebindTrust(leftId, rightId, rebindOutgoing, _outgoingTrust, true);
        }

        private static Peer[] MergeTrust(IDictionary<int, List<Peer>> dict, int leftId, int rightId)
        {
            dict[leftId] =
                dict[leftId]
                .Concat(dict[rightId])
                .Where(p => p.TargetId != leftId && p.TargetId != rightId)
                .GroupBy(t => t.TargetId)
                .Select(g => new Peer(g.Key, g.Sum(p => p.Trust)))
                .ToList();
            var rebind = dict[rightId].Where(p => p.TargetId != leftId).ToArray();
            dict.Remove(rightId);
            return rebind;
        }

        private static void RebindTrust(int leftId, int rightId, Peer[] rebindIncoming, IDictionary<int, List<Peer>> dict, bool isOrdered)
        {
            foreach (var removedIncoming in rebindIncoming)
            {
                var addTrust = removedIncoming.Trust;
                var list = dict[removedIncoming.TargetId];
                var n = list.Count;
                var i = 0;
                for (; i < n; i++)
                {
                    var peer = list[i];
                    if (peer.TargetId == leftId || peer.TargetId == rightId)
                    {
                        if (peer.TargetId == leftId)
                            addTrust += peer.Trust;
                        list.RemoveAt(i--);
                        n--;
                    }
                }
                if (isOrdered)
                    for (i = 0; i < n; i++)
                        if (list[i].Trust < addTrust)
                            break;
                list.Insert(i, new Peer(leftId, addTrust));
            }
        }

        private static void MergeIndividuals(Pair left, Pair right)
        {
            var newIndividuals = new Individual[left.Individuals.Length + right.Individuals.Length];
            Array.Copy(left.Individuals, newIndividuals, left.Individuals.Length);
            Array.Copy(right.Individuals, 0, newIndividuals, left.Individuals.Length, right.Individuals.Length);
            left.Individuals = newIndividuals;
        }

        private void Gather(Dictionary<int, Individual> calibrated)
        {
            _incomingTrust = new Dictionary<int, List<Peer>>();
            _outgoingTrust = new Dictionary<int, List<Peer>>();
            foreach (var ind in calibrated.Values)
            {
                var fromId = ind.Id;
                foreach (var p in ind.Peers)
                {
                    var toId = p.TargetId;
                    if (!calibrated.ContainsKey(toId)) continue;
                    Add(_incomingTrust, toId, new Peer(fromId, p.Trust));
                    Add(_outgoingTrust, ind.Id, p);
                }
                if (_outgoingTrust.TryGetValue(ind.Id, out var val))
                    val.Sort();
            }
            _pairs = new Pair[_incomingTrust.Count];
            int i = 0;
            foreach (var t in _incomingTrust)
            {
                var ind = calibrated[t.Key];
                t.Value.Sort();
                _pairs[i++] = new()
                {
                    Id = ind.Id,
                    Individuals = new[] { ind },
                    Popularity = t.Value.Sum(p => p.Trust),
                };
            }
            Array.Sort(_pairs);
            _pairLookup = _pairs.ToDictionary(p => p.Id);
        }

        private static void Add(IDictionary<int, List<Peer>> dict, int key, Peer val)
        {
            if (!dict.TryGetValue(key, out var list))
                dict[key] = list = new List<Peer>();
            list.Add(val);
        }

        private Tribe[] GenerateTribes()
        {
            return _pairs.Where(p => p.Individuals.Length > 1).Select(GenerateTribe).ToArray();

            static Tribe GenerateTribe(Pair pair)
                => new()
                {
                    Id = $"{pair.Individuals[0].Id}-{pair.Individuals[1].Id}",
                    Members = pair.Individuals
                };
        }
    }
}