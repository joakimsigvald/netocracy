using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Netocracy.Console.Business
{
    public class TribeService
    {
        public Task<Tribe[]> ComputeTribes(params Individual[] individuals)
        {
            var calibrated = individuals.Select(IndividualComputer.Calibrate).ToDictionary(ind => ind.Id);
            var matchable = Gather(calibrated).ToDictionary(inh => inh.Individual.Id);
            var tribes = new List<Tribe>();
            foreach (var next in matchable.Values.OrderByDescending(p => p.Popularity))
            {
                var threshold = next.Individual.LowerMatchThreshold;
                var match = next.SortedPeers
                    .TakeWhile(p => p.Trust > threshold)
                    .Select(p => matchable.TryGetValue(p.TargetId, out var val) ? val : null)
                    .Where(p => p != null && CanMatchWith(p, next))
                    .FirstOrDefault();
                if (match != null)
                {
                    var tribe = new Tribe
                    {
                        Id = $"{next.Individual.Id}-{match.Individual.Id}",
                        Members = new[] { next, match }
                    };
                    tribes.Add(tribe);
                    next.Tribe = tribe;
                    match.Tribe = tribe;
                    matchable.Remove(next.Individual.Id);
                    matchable.Remove(match.Individual.Id);
                }
            }
            tribes.AddRange(matchable.Values.Select(p => new Tribe
            {
                Id = $"{p.Individual.Id}",
                Members = new[] { p }
            }));
            return Task.FromResult(tribes.ToArray());
        }

        private static bool CanMatchWith(Inhabitant subject, Inhabitant target)
            => subject.SortedPeers
            .TakeWhile(p => p.Trust > subject.Individual.UpperMatchThreshold)
            .Any(p => p.TargetId == target.Individual.Id);

        private IEnumerable<Inhabitant> Gather(Dictionary<int, Individual> calibrated)
        {

            return calibrated.Values
                .SelectMany(ci => ci.Peers)
                .GroupBy(p => p.TargetId)
                .Select(CreateInhabitant)
                .Where(v => v != null);

            Inhabitant CreateInhabitant(IGrouping<int, Peer> fans)
                => calibrated.TryGetValue(fans.Key, out var individual)
                    ? new()
                    {
                        Individual = individual,
                        Popularity = fans.Sum(p => p.Trust),
                        SortedPeers = individual.Peers.OrderBy(p => p.Trust).ToArray()
                    } : null;
        }
    }
}