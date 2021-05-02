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
                    Id = i,
                    Peers = GeneratePeers().ToList()
                };
                foreach (var peer in newInd.Peers)
                {
                    pods[peer.TargetId].Peers.Add(new Peer { TargetId = newInd.Id, Trust = peer.Trust });
                }
                pods.Add(newInd);
            }
            return pods.Select(MapToIndividual).Select(Calibrate).ToArray();

            IEnumerable<Peer> GeneratePeers()
            {
                var n = pods.Count;
                var stocasticPods = pods
                    .Select(ind => (o: StocasticShift(n, ind.Id), i: ind.Id))
                    .OrderBy(t => t.o)
                    .Select(t => t.i)
                    .ToArray();
                var friendPeers = stocasticPods.Take(friends).Select(i => new Peer { TargetId = i, Trust = 1 }).ToArray();
                var foePeers = stocasticPods.Skip(friends).Take(foes).Select(i => new Peer { TargetId = i, Trust = -1 }).ToArray();
                return friendPeers.Concat(foePeers);
            }
        }

        private static Individual MapToIndividual(Pod pod) => new(pod.Id + 1, pod.Peers.Select(p => new Peer(p.TargetId + 1, p.Trust)).ToArray());

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

        public static int StocasticShift(int count, int number)
        {
            var nBits = (int)Math.Ceiling(Math.Log2(count));
            if (nBits < 2) return number;
            if (nBits % 2 == 1) 
                nBits++;
            var shifted = (number + 1) % count;
            var halfBits = nBits / 2;
            var mid = 1 << halfBits;
            var lower = (shifted % mid) << halfBits;
            var upper = shifted >> halfBits;
            return lower + upper;
        }
    }
}