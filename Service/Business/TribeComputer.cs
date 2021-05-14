using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Netocracy.Console.Business
{
    //https://docs.google.com/document/d/1a0LRTN9ta6nwODoeKM3mUHrLAL_PDSnsUVLHIWhLJcA/edit?usp=sharing
    public class TribeComputer
    {
        private IDictionary<int, float> _popularity;
        private IDictionary<int, Peer[]> _outgoingTrust;
        private IDictionary<int, Pair> _pairLookup;
        private IDictionary<int, int> _reroute = new Dictionary<int, int>();
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
            _reroute.Clear();
            for (var i = 0; i < n; i++)
            {
                var next = _pairs[i];
                if (next.Popularity == float.MinValue) continue;
                var (gallant, bride) = FindMatch(next);
                if (bride != null)
                {
                    _reroute.Add(bride.Id, gallant.Id);
                    MergePairs(gallant, bride);
                }
            }
            foreach (var id in _outgoingTrust.Keys)
                MergeTrust(id, _outgoingTrust);
            ComputeIncomingTrust();
            foreach (var p in _pairs.Where(p => p.Popularity != float.MinValue))
                p.Popularity = _popularity.TryGetValue(p.Id, out var val) ? val : 0;
            Array.Sort(_pairs);
            _pairs = _pairs[..^_reroute.Count];
            if (_pairs.Select(p => p.Id).Distinct().Count() < _pairs.Length)
                throw new InvalidProgramException();
        }

        private (Pair gallant, Pair bride) FindMatch(Pair gallant)
        {
            var outgoing = _outgoingTrust[gallant.Id];
            foreach (var candidate in outgoing)
            {
                if (candidate.Trust <= 0)
                    return default;
                var bride = ProposeTo(candidate);
                if (bride != null)
                {
                    if (bride.Popularity < float.MinValue / 2)
                        throw new InvalidProgramException();
                    return gallant.Individuals.Length < bride.Individuals.Length
                        ? (bride, gallant)
                        : (gallant, bride);
                }
            }
            return default;

            Pair ProposeTo(Peer candidate)
            {
                var candidateId = candidate.TargetId;
                Peer[] candidateTrust;
                while (!_outgoingTrust.TryGetValue(candidateId, out candidateTrust))
                    candidateId = _reroute[candidateId];
                foreach (var mutualTrust in candidateTrust)
                {
                    if (mutualTrust.Trust <= 0)
                        return default;
                    if (mutualTrust.TargetId == gallant.Id)
                        return _pairLookup[candidateId];
                }
                return default;
            }
        }

        private void MergePairs(Pair left, Pair right)
        {
            if (left.Id == right.Id)
                throw new InvalidProgramException();
            if (left.Popularity < float.MinValue / 2)
                throw new InvalidProgramException();
            MergeIndividuals(left, right);
            MergeOutgoingTrust(left.Id, right.Id);
            right.Popularity = float.MinValue;
            _pairLookup.Remove(right.Id);
        }

        private void MergeOutgoingTrust(int leftId, int rightId)
        {
            var dict = _outgoingTrust[leftId].ToDictionary(p => p.TargetId, p => p.Trust);
            dict.Remove(rightId);
            foreach (var p in _outgoingTrust[rightId])
                AddTrust(leftId, dict, GetId(p.TargetId), p.Trust);
            _outgoingTrust[leftId] = GenerateMergedPeers(dict);
            _outgoingTrust.Remove(rightId);
        }

        private static void MergeIndividuals(Pair left, Pair right)
        {
            var newIndividuals = new Individual[left.Individuals.Length + right.Individuals.Length];
            Array.Copy(left.Individuals, newIndividuals, left.Individuals.Length);
            Array.Copy(right.Individuals, 0, newIndividuals, left.Individuals.Length, right.Individuals.Length);
            left.Individuals = newIndividuals;
        }

        private void MergeTrust(int id, IDictionary<int, Peer[]> trusts)
        {
            var dict = new Dictionary<int, float>();
            foreach (var p in trusts[id])
                AddTrust(id, dict, GetId(p.TargetId), p.Trust);
            trusts[id] = GenerateMergedPeers(dict);
        }

        private int GetId(int id)
        {
            while (_reroute.TryGetValue(id, out var nid)) id = nid;
            return id;
        }

        private static void AddTrust(int sourceId, Dictionary<int, float> mergedTrust, int targetId, float trust)
        {
            if (sourceId == targetId)
                return;
            if (!mergedTrust.TryGetValue(targetId, out var val))
                mergedTrust.Add(targetId, trust);
            else if (val == -trust)
                mergedTrust.Remove(targetId);
            else
                mergedTrust[targetId] = val + trust;
        }

        private static Peer[] GenerateMergedPeers(Dictionary<int, float> mergedTrust)
        {
            var mergedPeers = mergedTrust.Select(t => new Peer(t.Key, t.Value)).ToArray();
            Array.Sort(mergedPeers);
            return mergedPeers;
        }

        private void Gather(Dictionary<int, Individual> calibrated)
        {
            _outgoingTrust = new Dictionary<int, Peer[]>();
            _popularity = new Dictionary<int, float>();
            foreach (var ind in calibrated.Values)
            {
                var fromId = ind.Id;
                var arr = ind.Peers.Where(p => calibrated.ContainsKey(p.TargetId)).ToArray();
                if (arr.Length == 0)
                    continue;
                Array.Sort(arr);
                _outgoingTrust[ind.Id] = arr;
            }
            ComputeIncomingTrust();
            _pairs = new Pair[_popularity.Count];
            int i = 0;
            foreach (var t in _popularity)
            {
                var ind = calibrated[t.Key];
                _pairs[i++] = new()
                {
                    Id = ind.Id,
                    Individuals = new[] { ind },
                    Popularity = t.Value,
                };
            }
            Array.Sort(_pairs);
            _pairLookup = _pairs.ToDictionary(p => p.Id);
        }

        private void ComputeIncomingTrust()
        {
            _popularity = new Dictionary<int, float>();
            foreach (var t in _outgoingTrust)
                foreach (var p in t.Value)
                    _popularity[p.TargetId] = _popularity.TryGetValue(p.TargetId, out var val)
                        ? val + p.Trust
                        : p.Trust;
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