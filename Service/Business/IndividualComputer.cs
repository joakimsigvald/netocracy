using System;
using System.Collections.Generic;
using System.Linq;

namespace Netocracy.Console.Business
{
    public static class IndividualComputer
    {
        public static Individual[] GenerateIndividuals(int count, int friends, int foes)
        {
            var individuals = new List<Individual>();
            for (var i = 0; i < count; i++)
            {
                var newInd = new Individual
                {
                    Id = i + 1,
                    Index = i,
                    Peers = GeneratePeers(individuals, friends, foes).ToList()
                };
                foreach (var peer in newInd.Peers)
                {
                    individuals[peer.Index].Peers.Add(new Peer { Index = newInd.Index, Trust = peer.Trust });
                }
                individuals.Add(newInd);
            }
            return individuals.Select(Calibrate).ToArray();
        }

        public static Individual Calibrate(Individual individual)
        {
            return new Individual
            {
                Id = individual.Id,
                Index = individual.Index,
                Peers = Calibrate(individual.Peers).ToList()
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

        private static IEnumerable<Peer> GeneratePeers(List<Individual> individuals, int friendCount, int foeCount)
        {
            var n = individuals.Count;
            var stocasticIndividuals = individuals
                .Select(ind => (o: StocasticShift(n, ind.Index), i: ind.Index))
                .OrderBy(t => t.o)
                .ToArray();
            var friends = stocasticIndividuals.Take(friendCount).Select((_, i) => new Peer { Index = i, Trust = 1 });
            var foes = stocasticIndividuals.Skip(friendCount).Take(foeCount).Select((_, i) => new Peer { Index = i, Trust = 1 });
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