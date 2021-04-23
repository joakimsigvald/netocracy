using System.Linq;
using System.Threading.Tasks;

namespace Netocracy.Console.Business
{
    public class TribeService
    {
        private readonly RelationComputer _relationComputer;

        public TribeService(RelationComputer relationComputer) => _relationComputer = relationComputer;

        public async Task<Tribe[]> ComputeTribes(Individual[] individuals)
        {
            //var calibrated = individuals.Select(IndividualComputer.Calibrate).ToArray();
            //var relations = await _relationComputer.ComputeRelations(individuals);
            //var connections = ConnectionComputer.ComputeConnections(relations);
            return await Task.FromResult(TribeComputer2.ComputeTribes(individuals));
        }
    }
}
