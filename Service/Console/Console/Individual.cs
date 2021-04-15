using System.Collections.Generic;

namespace Console
{
    public class Individual
    {
        public int Id { get; set; }
        public int Index { get; set; }
        public int MembershipNumber { get; set; }
        public List<Peer> Peers { get; set; }
        public Tribe Tribe { get; set; }
    }
}