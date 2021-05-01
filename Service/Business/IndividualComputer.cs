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
                    Peers = GeneratePeers(pods, friends, foes).ToList()
                };
                foreach (var peer in newInd.Peers)
                {
                    pods[peer.TargetId - 1].Peers.Add(new Peer { TargetId = newInd.Id, Trust = peer.Trust });
                }
                pods.Add(newInd);
            }
            return pods.Select(MapToIndividual).Select(Calibrate).ToArray();
        }

        private static Individual MapToIndividual(Pod pod) => new(pod.Id, pod.Peers.ToArray());

        public static Individual Calibrate(Individual individual)
        {
            var peers = excludeSelf(individual.Peers);
            return new (individual.Id, Calibrate().ToArray());

            Peer[] excludeSelf(Peer[] peers)
                => peers.Any(p => p.TargetId == individual.Id)
                ? peers.Where(p => p.TargetId != individual.Id).ToArray()
                : peers;

            IEnumerable<Peer> Calibrate()
            {
                if (!peers.Any())
                    return peers;
                var sumOfAbsoluteTrust = MapAbsoluteTrust().Sum();
                return sumOfAbsoluteTrust > 0 ? CalibrateTrust(sumOfAbsoluteTrust) : peers;
            }

            IEnumerable<Peer> CalibrateTrust(float sumOfAbsoluteTrust)
                => sumOfAbsoluteTrust == 1
                    ? peers
                    : peers.Select(p => new Peer { TargetId = p.TargetId, Trust = p.Trust / sumOfAbsoluteTrust });

            float[] MapAbsoluteTrust()
                => peers.Select(p => Math.Abs(p.Trust)).ToArray();
        }

        private static IEnumerable<Peer> GeneratePeers(List<Pod> pods, int friendCount, int foeCount)
        {
            var n = pods.Count;
            var stocasticPods = pods
                .Select(ind => (o: StocasticShift(n, ind.Id), i: ind.Id))
                .OrderBy(t => t.o)
                .ToArray();
            var friends = stocasticPods.Take(friendCount).Select((_, i) => new Peer { TargetId = i + 1, Trust = 1 }).ToArray();
            var foes = stocasticPods.Skip(friendCount).Take(foeCount).Select((_, i) => new Peer { TargetId = i + 1, Trust = 1 }).ToArray();
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