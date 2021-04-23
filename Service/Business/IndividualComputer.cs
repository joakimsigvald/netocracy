using System;
using System.Collections.Generic;
using System.Linq;

namespace Netocracy.Console.Business
{
    public static class IndividualComputer
    {
        public static Individual[] GenerateIndividuals(int count, int friends, int foes)
        {
            var pods = new List<Pod>();
            for (var i = 0; i < count; i++)
            {
                var newInd = new Pod
                {
                    Id = i + 1,
                    Index = i,
                    Peers = GeneratePeers(pods, friends, foes).ToList()
                };
                foreach (var peer in newInd.Peers)
                {
                    pods[peer.Index].Peers.Add(new Peer { Index = newInd.Index, Trust = peer.Trust });
                }
                pods.Add(newInd);
            }
            return pods.Select(MapToIndividual).Select(Calibrate).ToArray();
        }

        private static Individual MapToIndividual(Pod pod) => new()
        {
            Id = pod.Id,
            Peers = pod.Peers.ToArray()
        };

        public static Individual Calibrate(Individual individual)
        {
            return new Individual
            {
                Id = individual.Id,
                Peers = Calibrate(individual.Peers).ToArray()
            };

            IEnumerable<Peer> Calibrate(IList<Peer> peers)
            {
                if (!peers.Any())
                    return peers;
                var sumOfAbsoluteTrust = MapAbsoluteTrust(peers).Sum();
                return sumOfAbsoluteTrust > 0 ? CalibrateTrust(peers, sumOfAbsoluteTrust) : peers;
            }

            IEnumerable<Peer> CalibrateTrust(IEnumerable<Peer> peers, float sumOfAbsoluteTrust)
                => sumOfAbsoluteTrust == 1
                    ? peers
                    : peers.Select(p => new Peer { Index = p.Index, Trust = p.Trust / sumOfAbsoluteTrust });

            static float[] MapAbsoluteTrust(IEnumerable<Peer> peers)
                => peers.Select(p => Math.Abs(p.Trust)).ToArray();
        }

        private static IEnumerable<Peer> GeneratePeers(List<Pod> pods, int friendCount, int foeCount)
        {
            var n = pods.Count;
            var stocasticPods = pods
                .Select(ind => (o: StocasticShift(n, ind.Index), i: ind.Index))
                .OrderBy(t => t.o)
                .ToArray();
            var friends = stocasticPods.Take(friendCount).Select((_, i) => new Peer { Index = i, Trust = 1 }).ToArray();
            var foes = stocasticPods.Skip(friendCount).Take(foeCount).Select((_, i) => new Peer { Index = i, Trust = 1 }).ToArray();
            return friends.Concat(foes);
        }

        private static int StocasticShift(int n, int number)
        {
            var nBits = (int)Math.Ceiling(Math.Log2(n));
            var bound = 1 << nBits;
            var shifted = bound - n - 1 + number << 1;
            return shifted < bound ? shifted : (shifted + 1) % bound;
        }
    }
}